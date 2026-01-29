(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all3) => {
    for (var name in all3)
      __defProp(target, name, { get: all3[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/preline/src/plugins/accessibility-manager/index.ts
  var HSAccessibilityObserver, accessibility_manager_default;
  var init_accessibility_manager = __esm({
    "node_modules/preline/src/plugins/accessibility-manager/index.ts"() {
      HSAccessibilityObserver = class {
        components = [];
        currentlyOpenedComponents = [];
        activeComponent = null;
        allowedKeybindings = /* @__PURE__ */ new Set([
          "Escape",
          "Enter",
          " ",
          "Space",
          "ArrowDown",
          "ArrowUp",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Home",
          "End"
        ]);
        constructor() {
          this.initGlobalListeners();
        }
        initGlobalListeners() {
          document.addEventListener(
            "keydown",
            (evt) => this.handleGlobalKeydown(evt)
          );
          document.addEventListener(
            "focusin",
            (evt) => this.handleGlobalFocusin(evt)
          );
        }
        isAllowedKeybinding(evt) {
          if (this.allowedKeybindings.has(evt.key)) {
            return true;
          }
          if (evt.key.length === 1 && /^[a-zA-Z]$/.test(evt.key) && !evt.metaKey && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
            return true;
          }
          return false;
        }
        getActiveComponent(el) {
          if (!el) return null;
          const containingComponents = this.components.filter(
            (comp) => comp.wrapper.contains(el) || comp.context && comp.context.contains(el)
          );
          if (containingComponents.length === 0) return null;
          if (containingComponents.length === 1) return containingComponents[0];
          let closestComponent = null;
          let minDistance = Number.MAX_SAFE_INTEGER;
          for (const comp of containingComponents) {
            let distance = 0;
            let current = el;
            while (current && current !== comp.wrapper && current !== comp.context) {
              distance++;
              current = current.parentElement;
            }
            if (distance < minDistance) {
              minDistance = distance;
              closestComponent = comp;
            }
          }
          return closestComponent;
        }
        handleGlobalFocusin(evt) {
          const target = evt.target;
          this.activeComponent = this.getActiveComponent(target);
        }
        handleGlobalKeydown(evt) {
          const target = evt.target;
          this.activeComponent = this.getActiveComponent(target);
          if (!this.activeComponent) return;
          if (!this.isAllowedKeybinding(evt)) {
            return;
          }
          switch (evt.key) {
            case "Escape":
              if (!this.activeComponent.isOpened) {
                const closestOpenParent = this.findClosestOpenParent(target);
                if (closestOpenParent?.handlers.onEsc) {
                  closestOpenParent.handlers.onEsc();
                  evt.preventDefault();
                  evt.stopPropagation();
                }
              } else if (this.activeComponent.handlers.onEsc) {
                this.activeComponent.handlers.onEsc();
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
            case "Enter":
              if (this.activeComponent.handlers.onEnter) {
                this.activeComponent.handlers.onEnter();
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
            case " ":
            case "Space":
              if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
                return;
              }
              if (this.activeComponent.handlers.onSpace) {
                this.activeComponent.handlers.onSpace();
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
            case "ArrowDown":
            case "ArrowUp":
            case "ArrowLeft":
            case "ArrowRight":
              if (this.activeComponent.handlers.onArrow) {
                if (evt.metaKey || evt.ctrlKey || evt.altKey || evt.shiftKey) {
                  return;
                }
                this.activeComponent.handlers.onArrow(evt);
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
            case "Tab":
              if (!this.activeComponent.handlers.onTab) break;
              const handler = evt.shiftKey ? this.activeComponent.handlers.onShiftTab : this.activeComponent.handlers.onTab;
              if (handler) handler();
              break;
            case "Home":
              if (this.activeComponent.handlers.onHome) {
                this.activeComponent.handlers.onHome();
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
            case "End":
              if (this.activeComponent.handlers.onEnd) {
                this.activeComponent.handlers.onEnd();
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
            default:
              if (this.activeComponent.handlers.onFirstLetter && evt.key.length === 1 && /^[a-zA-Z]$/.test(evt.key)) {
                this.activeComponent.handlers.onFirstLetter(evt.key);
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
          }
        }
        findClosestOpenParent(target) {
          let current = target.parentElement;
          while (current) {
            const parentComponent = this.currentlyOpenedComponents.find(
              (comp) => comp.wrapper === current && comp !== this.activeComponent
            );
            if (parentComponent) {
              return parentComponent;
            }
            current = current.parentElement;
          }
          return null;
        }
        registerComponent(wrapper, handlers, isOpened = true, name = "", selector = "", context) {
          const component = {
            wrapper,
            handlers,
            isOpened,
            name,
            selector,
            context,
            isRegistered: true
          };
          this.components.push(component);
          return component;
        }
        updateComponentState(component, isOpened) {
          component.isOpened = isOpened;
          if (isOpened) {
            if (!this.currentlyOpenedComponents.includes(component)) {
              this.currentlyOpenedComponents.push(component);
            }
          } else {
            this.currentlyOpenedComponents = this.currentlyOpenedComponents.filter(
              (comp) => comp !== component
            );
          }
        }
        unregisterComponent(component) {
          this.components = this.components.filter((comp) => comp !== component);
          this.currentlyOpenedComponents = this.currentlyOpenedComponents.filter(
            (comp) => comp !== component
          );
        }
        addAllowedKeybinding(key) {
          this.allowedKeybindings.add(key);
        }
        removeAllowedKeybinding(key) {
          this.allowedKeybindings.delete(key);
        }
        getAllowedKeybindings() {
          return Array.from(this.allowedKeybindings);
        }
      };
      accessibility_manager_default = HSAccessibilityObserver;
    }
  });

  // node_modules/preline/src/utils/index.ts
  var stringToBoolean, getClassProperty, getClassPropertyAlt, isDirectChild, isEnoughSpace, isFormElement, isIOS, isIpadOS, isJson, debounce, dispatch, afterTransition, htmlToElement, classToClassList;
  var init_utils = __esm({
    "node_modules/preline/src/utils/index.ts"() {
      stringToBoolean = (string) => {
        return string === "true" ? true : false;
      };
      getClassProperty = (el, prop, val = "") => {
        return (window.getComputedStyle(el).getPropertyValue(prop) || val).replace(
          " ",
          ""
        );
      };
      getClassPropertyAlt = (el, prop, val = "") => {
        let targetClass = "";
        el.classList.forEach((c) => {
          if (c.includes(prop)) {
            targetClass = c;
          }
        });
        return targetClass.match(/:(.*)]/) ? targetClass.match(/:(.*)]/)[1] : val;
      };
      isDirectChild = (parent, child) => {
        const children = parent.children;
        for (let i = 0; i < children.length; i++) {
          if (children[i] === child) return true;
        }
        return false;
      };
      isEnoughSpace = (el, toggle, preferredPosition = "auto", space = 10, wrapper = null) => {
        const referenceRect = toggle.getBoundingClientRect();
        const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : null;
        const viewportHeight = window.innerHeight;
        const spaceAbove = wrapperRect ? referenceRect.top - wrapperRect.top : referenceRect.top;
        const spaceBelow = (wrapper ? wrapperRect.bottom : viewportHeight) - referenceRect.bottom;
        const minimumSpaceRequired = el.clientHeight + space;
        if (preferredPosition === "bottom") {
          return spaceBelow >= minimumSpaceRequired;
        } else if (preferredPosition === "top") {
          return spaceAbove >= minimumSpaceRequired;
        } else {
          return spaceAbove >= minimumSpaceRequired || spaceBelow >= minimumSpaceRequired;
        }
      };
      isFormElement = (target) => {
        return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
      };
      isIOS = () => {
        if (/iPad|iPhone|iPod/.test(navigator.platform)) {
          return true;
        } else {
          return navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
        }
      };
      isIpadOS = () => {
        return navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
      };
      isJson = (str) => {
        if (typeof str !== "string") return false;
        const firstChar = str.trim()[0];
        const lastChar = str.trim().slice(-1);
        if (firstChar === "{" && lastChar === "}" || firstChar === "[" && lastChar === "]") {
          try {
            JSON.parse(str);
            return true;
          } catch {
            return false;
          }
        }
        return false;
      };
      debounce = (func, timeout = 200) => {
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            func.apply(void 0, args);
          }, timeout);
        };
      };
      dispatch = (evt, element, payload = null) => {
        const event = new CustomEvent(evt, {
          detail: { payload },
          bubbles: true,
          cancelable: true,
          composed: false
        });
        element.dispatchEvent(event);
      };
      afterTransition = (el, callback) => {
        const handleEvent = () => {
          callback();
          el.removeEventListener("transitionend", handleEvent, true);
        };
        const computedStyle = window.getComputedStyle(el);
        const transitionDuration = computedStyle.getPropertyValue(
          "transition-duration"
        );
        const transitionProperty = computedStyle.getPropertyValue(
          "transition-property"
        );
        const hasTransition = transitionProperty !== "none" && parseFloat(transitionDuration) > 0;
        if (hasTransition) el.addEventListener("transitionend", handleEvent, true);
        else callback();
      };
      htmlToElement = (html) => {
        const template = document.createElement("template");
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
      };
      classToClassList = (classes, target, splitter = " ", action = "add") => {
        const classesToArray = classes.split(splitter);
        classesToArray.forEach((cl) => {
          if (cl.trim()) {
            action === "add" ? target.classList.add(cl) : target.classList.remove(cl);
          }
        });
      };
    }
  });

  // node_modules/preline/src/plugins/base-plugin/index.ts
  var HSBasePlugin;
  var init_base_plugin = __esm({
    "node_modules/preline/src/plugins/base-plugin/index.ts"() {
      HSBasePlugin = class {
        constructor(el, options, events) {
          this.el = el;
          this.options = options;
          this.events = events;
          this.el = el;
          this.options = options;
          this.events = {};
        }
        createCollection(collection, element) {
          collection.push({
            id: element?.el?.id || collection.length + 1,
            element
          });
        }
        fireEvent(evt, payload = null) {
          if (this.events.hasOwnProperty(evt)) return this.events[evt](payload);
        }
        on(evt, cb) {
          this.events[evt] = cb;
        }
      };
    }
  });

  // node_modules/preline/src/constants.ts
  var POSITIONS, BREAKPOINTS;
  var init_constants = __esm({
    "node_modules/preline/src/constants.ts"() {
      POSITIONS = {
        auto: "auto",
        "auto-start": "auto-start",
        "auto-end": "auto-end",
        top: "top",
        "top-left": "top-start",
        "top-right": "top-end",
        bottom: "bottom",
        "bottom-left": "bottom-start",
        "bottom-right": "bottom-end",
        right: "right",
        "right-start": "right-start",
        "right-end": "right-end",
        left: "left",
        "left-start": "left-start",
        "left-end": "left-end"
      };
      BREAKPOINTS = {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        "2xl": 1536
      };
    }
  });

  // node_modules/preline/src/plugins/select/index.ts
  var HSSelect, select_default;
  var init_select = __esm({
    "node_modules/preline/src/plugins/select/index.ts"() {
      init_utils();
      init_base_plugin();
      init_accessibility_manager();
      init_constants();
      HSSelect = class _HSSelect extends HSBasePlugin {
        accessibilityComponent;
        value;
        placeholder;
        hasSearch;
        minSearchLength;
        preventSearchFocus;
        mode;
        viewport;
        _isOpened;
        isMultiple;
        isDisabled;
        selectedItems;
        apiUrl;
        apiQuery;
        apiOptions;
        apiDataPart;
        apiSearchQueryKey;
        apiLoadMore;
        apiFieldsMap;
        apiIconTag;
        apiSelectedValues;
        toggleTag;
        toggleClasses;
        toggleSeparators;
        toggleCountText;
        toggleCountTextPlacement;
        toggleCountTextMinItems;
        toggleCountTextMode;
        wrapperClasses;
        tagsItemTemplate;
        tagsItemClasses;
        tagsInputId;
        tagsInputClasses;
        dropdownTag;
        dropdownClasses;
        dropdownDirectionClasses;
        dropdownSpace;
        dropdownPlacement;
        dropdownAutoPlacement;
        dropdownVerticalFixedPlacement;
        dropdownScope;
        searchTemplate;
        searchWrapperTemplate;
        searchPlaceholder;
        searchId;
        searchLimit;
        isSearchDirectMatch;
        searchClasses;
        searchWrapperClasses;
        searchNoResultTemplate;
        searchNoResultText;
        searchNoResultClasses;
        optionAllowEmptyOption;
        optionTag;
        optionTemplate;
        optionClasses;
        descriptionClasses;
        iconClasses;
        animationInProcess;
        currentPage;
        isLoading;
        hasMore;
        wrapper;
        toggle;
        toggleTextWrapper;
        tagsInput;
        dropdown;
        floatingUIInstance;
        searchWrapper;
        search;
        searchNoResult;
        selectOptions;
        extraMarkup;
        isAddTagOnEnter;
        tagsInputHelper;
        remoteOptions;
        disabledObserver = null;
        optionId = 0;
        onWrapperClickListener;
        onToggleClickListener;
        onTagsInputFocusListener;
        onTagsInputInputListener;
        onTagsInputInputSecondListener;
        onTagsInputKeydownListener;
        onSearchInputListener;
        isSelectedOptionOnTop;
        constructor(el, options) {
          super(el, options);
          const data = el.getAttribute("data-hs-select");
          const dataOptions = data ? JSON.parse(data) : {};
          const concatOptions = {
            ...dataOptions,
            ...options
          };
          this.value = concatOptions?.value || this.el.value || null;
          this.placeholder = concatOptions?.placeholder || "Select...";
          this.hasSearch = concatOptions?.hasSearch || false;
          this.minSearchLength = concatOptions?.minSearchLength ?? 0;
          this.preventSearchFocus = concatOptions?.preventSearchFocus || false;
          this.mode = concatOptions?.mode || "default";
          this.viewport = typeof concatOptions?.viewport !== "undefined" ? document.querySelector(concatOptions?.viewport) : null;
          this._isOpened = Boolean(concatOptions?.isOpened) || false;
          this.isMultiple = this.el.hasAttribute("multiple") || false;
          this.isDisabled = this.el.hasAttribute("disabled") || false;
          this.selectedItems = [];
          this.apiUrl = concatOptions?.apiUrl || null;
          this.apiQuery = concatOptions?.apiQuery || null;
          this.apiOptions = concatOptions?.apiOptions || null;
          this.apiSearchQueryKey = concatOptions?.apiSearchQueryKey || null;
          this.apiDataPart = concatOptions?.apiDataPart || null;
          this.apiLoadMore = concatOptions?.apiLoadMore === true ? {
            perPage: 10,
            scrollThreshold: 100
          } : typeof concatOptions?.apiLoadMore === "object" && concatOptions?.apiLoadMore !== null ? {
            perPage: concatOptions.apiLoadMore.perPage || 10,
            scrollThreshold: concatOptions.apiLoadMore.scrollThreshold || 100
          } : false;
          this.apiFieldsMap = concatOptions?.apiFieldsMap || null;
          this.apiIconTag = concatOptions?.apiIconTag || null;
          this.apiSelectedValues = concatOptions?.apiSelectedValues || null;
          this.currentPage = 0;
          this.isLoading = false;
          this.hasMore = true;
          this.wrapperClasses = concatOptions?.wrapperClasses || null;
          this.toggleTag = concatOptions?.toggleTag || null;
          this.toggleClasses = concatOptions?.toggleClasses || null;
          this.toggleCountText = typeof concatOptions?.toggleCountText === void 0 ? null : concatOptions.toggleCountText;
          this.toggleCountTextPlacement = concatOptions?.toggleCountTextPlacement || "postfix";
          this.toggleCountTextMinItems = concatOptions?.toggleCountTextMinItems || 1;
          this.toggleCountTextMode = concatOptions?.toggleCountTextMode || "countAfterLimit";
          this.toggleSeparators = {
            items: concatOptions?.toggleSeparators?.items || ", ",
            betweenItemsAndCounter: concatOptions?.toggleSeparators?.betweenItemsAndCounter || "and"
          };
          this.tagsItemTemplate = concatOptions?.tagsItemTemplate || null;
          this.tagsItemClasses = concatOptions?.tagsItemClasses || null;
          this.tagsInputId = concatOptions?.tagsInputId || null;
          this.tagsInputClasses = concatOptions?.tagsInputClasses || null;
          this.dropdownTag = concatOptions?.dropdownTag || null;
          this.dropdownClasses = concatOptions?.dropdownClasses || null;
          this.dropdownDirectionClasses = concatOptions?.dropdownDirectionClasses || null;
          this.dropdownSpace = concatOptions?.dropdownSpace || 10;
          this.dropdownPlacement = concatOptions?.dropdownPlacement || null;
          this.dropdownVerticalFixedPlacement = concatOptions?.dropdownVerticalFixedPlacement || null;
          this.dropdownScope = concatOptions?.dropdownScope || "parent";
          this.dropdownAutoPlacement = concatOptions?.dropdownAutoPlacement || false;
          this.searchTemplate = concatOptions?.searchTemplate || null;
          this.searchWrapperTemplate = concatOptions?.searchWrapperTemplate || null;
          this.searchWrapperClasses = concatOptions?.searchWrapperClasses || "bg-white p-2 sticky top-0";
          this.searchId = concatOptions?.searchId || null;
          this.searchLimit = concatOptions?.searchLimit || Infinity;
          this.isSearchDirectMatch = typeof concatOptions?.isSearchDirectMatch !== "undefined" ? concatOptions?.isSearchDirectMatch : true;
          this.searchClasses = concatOptions?.searchClasses || "block w-[calc(100%-32px)] text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 py-2 px-3 my-2 mx-4";
          this.searchPlaceholder = concatOptions?.searchPlaceholder || "Search...";
          this.searchNoResultTemplate = concatOptions?.searchNoResultTemplate || "<span></span>";
          this.searchNoResultText = concatOptions?.searchNoResultText || "No results found";
          this.searchNoResultClasses = concatOptions?.searchNoResultClasses || "px-4 text-sm text-gray-800 dark:text-neutral-200";
          this.optionAllowEmptyOption = typeof concatOptions?.optionAllowEmptyOption !== "undefined" ? concatOptions?.optionAllowEmptyOption : false;
          this.optionTemplate = concatOptions?.optionTemplate || null;
          this.optionTag = concatOptions?.optionTag || null;
          this.optionClasses = concatOptions?.optionClasses || null;
          this.extraMarkup = concatOptions?.extraMarkup || null;
          this.descriptionClasses = concatOptions?.descriptionClasses || null;
          this.iconClasses = concatOptions?.iconClasses || null;
          this.isAddTagOnEnter = concatOptions?.isAddTagOnEnter ?? true;
          this.isSelectedOptionOnTop = concatOptions?.isSelectedOptionOnTop ?? false;
          this.animationInProcess = false;
          this.selectOptions = [];
          this.remoteOptions = [];
          this.tagsInputHelper = null;
          this.disabledObserver = new MutationObserver((muts) => {
            if (muts.some((m) => m.attributeName === "disabled")) {
              this.setDisabledState(this.el.hasAttribute("disabled"));
            }
          });
          this.disabledObserver.observe(this.el, {
            attributes: true,
            attributeFilter: ["disabled"]
          });
          this.init();
        }
        wrapperClick(evt) {
          if (!evt.target.closest("[data-hs-select-dropdown]") && !evt.target.closest("[data-tag-value]")) {
            this.tagsInput.focus();
          }
        }
        toggleClick() {
          if (this.isDisabled) return false;
          this.toggleFn();
        }
        tagsInputFocus() {
          if (!this._isOpened) this.open();
        }
        tagsInputInput() {
          this.calculateInputWidth();
        }
        tagsInputInputSecond(evt) {
          if (!this.apiUrl) {
            this.searchOptions(evt.target.value);
          }
        }
        tagsInputKeydown(evt) {
          if (evt.key === "Enter" && this.isAddTagOnEnter) {
            const val = evt.target.value;
            if (this.selectOptions.find((el) => el.val === val)) {
              return false;
            }
            this.addSelectOption(val, val);
            this.buildOption(val, val);
            this.buildOriginalOption(val, val);
            this.dropdown.querySelector(`[data-value="${val}"]`).click();
            this.resetTagsInputField();
          }
        }
        searchInput(evt) {
          const newVal = evt.target.value;
          if (this.apiUrl) this.remoteSearch(newVal);
          else this.searchOptions(newVal);
        }
        setValue(val) {
          this.value = val;
          this.clearSelections();
          if (Array.isArray(val)) {
            if (this.mode === "tags") {
              this.unselectMultipleItems();
              this.selectMultipleItems();
              this.selectedItems = [];
              const existingTags = this.wrapper.querySelectorAll("[data-tag-value]");
              existingTags.forEach((tag) => tag.remove());
              this.setTagsItems();
              this.reassignTagsInputPlaceholder(
                this.hasValue() ? "" : this.placeholder
              );
            } else {
              this.toggleTextWrapper.innerHTML = this.hasValue() ? this.stringFromValue() : this.placeholder;
              this.unselectMultipleItems();
              this.selectMultipleItems();
            }
          } else {
            this.setToggleTitle();
            if (this.toggle.querySelector("[data-icon]")) this.setToggleIcon();
            if (this.toggle.querySelector("[data-title]")) this.setToggleTitle();
            this.selectSingleItem();
          }
        }
        setDisabledState(isDisabled) {
          this.isDisabled = isDisabled;
          const target = this.mode === "tags" ? this.wrapper : this.toggle;
          target?.classList.toggle("disabled", isDisabled);
          if (isDisabled && this.isOpened()) this.close();
        }
        hasValue() {
          if (!this.isMultiple) {
            return this.value !== null && this.value !== void 0 && this.value !== "";
          }
          return Array.isArray(this.value) && this.value.length > 0 && this.value.some((val) => val !== null && val !== void 0 && val !== "");
        }
        init() {
          this.createCollection(window.$hsSelectCollection, this);
          this.build();
          if (typeof window !== "undefined") {
            if (!window.HSAccessibilityObserver) {
              window.HSAccessibilityObserver = new accessibility_manager_default();
            }
            this.setupAccessibility();
          }
        }
        build() {
          this.el.style.display = "none";
          if (this.el.children) {
            Array.from(this.el.children).filter(
              (el) => this.optionAllowEmptyOption || !this.optionAllowEmptyOption && el.value && el.value !== ""
            ).forEach((el) => {
              const data = el.getAttribute("data-hs-select-option");
              this.selectOptions = [
                ...this.selectOptions,
                {
                  title: el.textContent,
                  val: el.value,
                  disabled: el.disabled,
                  options: data !== "undefined" ? JSON.parse(data) : null
                }
              ];
            });
          }
          if (this.optionAllowEmptyOption && !this.value) {
            this.value = "";
          }
          if (this.isMultiple) {
            const selectedOptions = Array.from(this.el.children).filter(
              (el) => el.selected
            );
            const values = [];
            selectedOptions.forEach((el) => {
              values.push(el.value);
            });
            this.value = values;
          }
          this.buildWrapper();
          if (this.mode === "tags") this.buildTags();
          else this.buildToggle();
          this.buildDropdown();
          if (this.extraMarkup) this.buildExtraMarkup();
        }
        buildWrapper() {
          this.wrapper = document.createElement("div");
          this.wrapper.classList.add("hs-select", "relative");
          this.setDisabledState(this.isDisabled);
          if (this.mode === "tags") {
            this.onWrapperClickListener = (evt) => this.wrapperClick(evt);
            this.wrapper.addEventListener("click", this.onWrapperClickListener);
          }
          if (this.wrapperClasses) {
            classToClassList(this.wrapperClasses, this.wrapper);
          }
          this.el.before(this.wrapper);
          this.wrapper.append(this.el);
        }
        buildExtraMarkup() {
          const appendMarkup = (markup) => {
            const el = htmlToElement(markup);
            this.wrapper.append(el);
            return el;
          };
          const clickHandle = (el) => {
            if (!el.classList.contains("--prevent-click")) {
              el.addEventListener("click", (evt) => {
                evt.stopPropagation();
                if (!this.isDisabled) this.toggleFn();
              });
            }
          };
          if (Array.isArray(this.extraMarkup)) {
            this.extraMarkup.forEach((el) => {
              const newEl = appendMarkup(el);
              clickHandle(newEl);
            });
          } else {
            const newEl = appendMarkup(this.extraMarkup);
            clickHandle(newEl);
          }
        }
        buildToggle() {
          let icon, title;
          this.toggleTextWrapper = document.createElement("span");
          this.toggleTextWrapper.classList.add("truncate");
          this.toggle = htmlToElement(this.toggleTag || "<div></div>");
          icon = this.toggle.querySelector("[data-icon]");
          title = this.toggle.querySelector("[data-title]");
          if (!this.isMultiple && icon) this.setToggleIcon();
          if (!this.isMultiple && title) this.setToggleTitle();
          if (this.isMultiple) {
            this.toggleTextWrapper.innerHTML = this.hasValue() ? this.stringFromValue() : this.placeholder;
          } else {
            this.toggleTextWrapper.innerHTML = this.getItemByValue(this.value)?.title || this.placeholder;
          }
          if (!title) this.toggle.append(this.toggleTextWrapper);
          if (this.toggleClasses) classToClassList(this.toggleClasses, this.toggle);
          if (this.isDisabled) this.toggle.classList.add("disabled");
          if (this.wrapper) this.wrapper.append(this.toggle);
          if (this.toggle?.ariaExpanded) {
            if (this._isOpened) this.toggle.ariaExpanded = "true";
            else this.toggle.ariaExpanded = "false";
          }
          this.onToggleClickListener = () => this.toggleClick();
          this.toggle.addEventListener("click", this.onToggleClickListener);
        }
        setToggleIcon() {
          const item = this.getItemByValue(this.value);
          const icon = this.toggle.querySelector("[data-icon]");
          if (icon) {
            icon.innerHTML = "";
            const img = htmlToElement(
              this.apiUrl && this.apiIconTag ? this.apiIconTag || "" : item?.options?.icon || ""
            );
            if (this.value && this.apiUrl && this.apiIconTag && item[this.apiFieldsMap.icon]) {
              img.src = item[this.apiFieldsMap.icon] || "";
            }
            icon.append(img);
            if (!img?.src) icon.classList.add("hidden");
            else icon.classList.remove("hidden");
          }
        }
        setToggleTitle() {
          const title = this.toggle.querySelector("[data-title]");
          let value = this.placeholder;
          if (this.optionAllowEmptyOption && this.value === "") {
            const emptyOption = this.selectOptions.find(
              (el) => el.val === ""
            );
            value = emptyOption?.title || this.placeholder;
          } else if (this.value) {
            if (this.apiUrl) {
              const selectedOption = this.remoteOptions.find(
                (el) => `${el[this.apiFieldsMap.val]}` === this.value || `${el[this.apiFieldsMap.title]}` === this.value
              );
              if (selectedOption) {
                value = selectedOption[this.apiFieldsMap.title];
              }
            } else {
              const selectedOption = this.selectOptions.find(
                (el) => el.val === this.value
              );
              if (selectedOption) {
                value = selectedOption.title;
              }
            }
          }
          if (title) {
            title.innerHTML = value;
            title.classList.add("truncate");
            this.toggle.append(title);
          } else {
            this.toggleTextWrapper.innerHTML = value;
          }
        }
        buildTags() {
          if (this.isDisabled) this.wrapper.classList.add("disabled");
          this.wrapper.setAttribute("tabindex", "0");
          this.buildTagsInput();
          this.setTagsItems();
        }
        reassignTagsInputPlaceholder(placeholder) {
          this.tagsInput.placeholder = placeholder;
          this.tagsInputHelper.innerHTML = placeholder;
          this.calculateInputWidth();
        }
        buildTagsItem(val) {
          const item = this.getItemByValue(val);
          let template, title, remove, icon;
          const newItem = document.createElement("div");
          newItem.setAttribute("data-tag-value", val);
          if (this.tagsItemClasses) classToClassList(this.tagsItemClasses, newItem);
          if (this.tagsItemTemplate) {
            template = htmlToElement(this.tagsItemTemplate);
            newItem.append(template);
          }
          if (item?.options?.icon || this.apiIconTag) {
            const img = htmlToElement(
              this.apiUrl && this.apiIconTag ? this.apiIconTag : item?.options?.icon
            );
            if (this.apiUrl && this.apiIconTag && item[this.apiFieldsMap.icon]) {
              img.src = item[this.apiFieldsMap.icon] || "";
            }
            icon = template ? template.querySelector("[data-icon]") : document.createElement("span");
            icon.append(img);
            if (!template) newItem.append(icon);
          }
          if (template && template.querySelector("[data-icon]") && !item?.options?.icon && !this.apiUrl && !this.apiIconTag && !item[this.apiFieldsMap?.icon]) {
            template.querySelector("[data-icon]").classList.add("hidden");
          }
          title = template ? template.querySelector("[data-title]") : document.createElement("span");
          if (this.apiUrl && this.apiFieldsMap?.title && item[this.apiFieldsMap.title]) {
            title.textContent = item[this.apiFieldsMap.title];
          } else {
            title.textContent = item.title || "";
          }
          if (!template) newItem.append(title);
          if (template) {
            remove = template.querySelector("[data-remove]");
          } else {
            remove = document.createElement("span");
            remove.textContent = "X";
            newItem.append(remove);
          }
          remove.addEventListener("click", () => {
            this.value = this.value.filter((el) => el !== val);
            this.selectedItems = this.selectedItems.filter((el) => el !== val);
            if (!this.hasValue()) {
              this.reassignTagsInputPlaceholder(this.placeholder);
            }
            this.unselectMultipleItems();
            this.selectMultipleItems();
            newItem.remove();
            this.triggerChangeEventForNativeSelect();
          });
          this.wrapper.append(newItem);
        }
        getItemByValue(val) {
          const value = this.apiUrl ? this.remoteOptions.find(
            (el) => `${el[this.apiFieldsMap.val]}` === val || el[this.apiFieldsMap.title] === val
          ) : this.selectOptions.find((el) => el.val === val);
          return value;
        }
        setTagsItems() {
          if (this.value) {
            const values = Array.isArray(this.value) ? this.value : this.value != null ? [this.value] : [];
            values.forEach((val) => {
              if (!this.selectedItems.includes(val)) this.buildTagsItem(val);
              this.selectedItems = !this.selectedItems.includes(val) ? [...this.selectedItems, val] : this.selectedItems;
            });
          }
          if (this._isOpened && this.floatingUIInstance) {
            this.floatingUIInstance.update();
          }
        }
        buildTagsInput() {
          this.tagsInput = document.createElement("input");
          if (this.tagsInputId) this.tagsInput.id = this.tagsInputId;
          if (this.tagsInputClasses) {
            classToClassList(this.tagsInputClasses, this.tagsInput);
          }
          this.tagsInput.setAttribute("tabindex", "-1");
          this.onTagsInputFocusListener = () => this.tagsInputFocus();
          this.onTagsInputInputListener = () => this.tagsInputInput();
          this.onTagsInputInputSecondListener = debounce(
            (evt) => this.tagsInputInputSecond(evt)
          );
          this.onTagsInputKeydownListener = (evt) => this.tagsInputKeydown(evt);
          this.tagsInput.addEventListener("focus", this.onTagsInputFocusListener);
          this.tagsInput.addEventListener("input", this.onTagsInputInputListener);
          this.tagsInput.addEventListener(
            "input",
            this.onTagsInputInputSecondListener
          );
          this.tagsInput.addEventListener("keydown", this.onTagsInputKeydownListener);
          this.wrapper.append(this.tagsInput);
          setTimeout(() => {
            this.adjustInputWidth();
            this.reassignTagsInputPlaceholder(
              this.hasValue() ? "" : this.placeholder
            );
          });
        }
        buildDropdown() {
          this.dropdown = htmlToElement(this.dropdownTag || "<div></div>");
          this.dropdown.setAttribute("data-hs-select-dropdown", "");
          if (this.dropdownScope === "parent") {
            this.dropdown.classList.add("absolute");
            if (!this.dropdownVerticalFixedPlacement) {
              this.dropdown.classList.add("top-full");
            }
          }
          this.dropdown.role = "listbox";
          this.dropdown.tabIndex = -1;
          this.dropdown.ariaOrientation = "vertical";
          if (!this._isOpened) this.dropdown.classList.add("hidden");
          if (this.dropdownClasses) {
            classToClassList(this.dropdownClasses, this.dropdown);
          }
          if (this.wrapper) this.wrapper.append(this.dropdown);
          if (this.dropdown && this.hasSearch) this.buildSearch();
          if (this.selectOptions) {
            this.selectOptions.forEach(
              (props, i) => this.buildOption(
                props.title,
                props.val,
                props.disabled,
                props.selected,
                props.options,
                `${i}`
              )
            );
          }
          if (this.apiUrl) this.optionsFromRemoteData();
          if (!this.apiUrl) {
            this.sortElements(this.el, "option");
            this.sortElements(this.dropdown, "[data-value]");
          }
          if (this.dropdownScope === "window") this.buildFloatingUI();
          if (this.dropdown && this.apiLoadMore) this.setupInfiniteScroll();
        }
        setupInfiniteScroll() {
          this.dropdown.addEventListener("scroll", this.handleScroll.bind(this));
        }
        async handleScroll() {
          if (!this.dropdown || this.isLoading || !this.hasMore || !this.apiLoadMore) return;
          const { scrollTop, scrollHeight, clientHeight } = this.dropdown;
          const scrollThreshold = typeof this.apiLoadMore === "object" ? this.apiLoadMore.scrollThreshold : 100;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < scrollThreshold;
          if (isNearBottom) await this.loadMore();
        }
        async loadMore() {
          if (!this.apiUrl || this.isLoading || !this.hasMore || !this.apiLoadMore) {
            return;
          }
          this.isLoading = true;
          try {
            const url = new URL(this.apiUrl);
            const paginationParam = this.apiFieldsMap?.page || this.apiFieldsMap?.offset || "page";
            const isOffsetBased = !!this.apiFieldsMap?.offset;
            const perPage = typeof this.apiLoadMore === "object" ? this.apiLoadMore.perPage : 10;
            if (isOffsetBased) {
              const offset3 = this.currentPage * perPage;
              url.searchParams.set(paginationParam, offset3.toString());
              this.currentPage++;
            } else {
              this.currentPage++;
              url.searchParams.set(paginationParam, this.currentPage.toString());
            }
            url.searchParams.set(
              this.apiFieldsMap?.limit || "limit",
              perPage.toString()
            );
            const response = await fetch(url.toString(), this.apiOptions || {});
            const data = await response.json();
            const items = this.apiDataPart ? data[this.apiDataPart] : data.results;
            const total = data.count || 0;
            const currentOffset = this.currentPage * perPage;
            if (items && items.length > 0) {
              this.remoteOptions = [...this.remoteOptions || [], ...items];
              this.buildOptionsFromRemoteData(items);
              this.hasMore = currentOffset < total;
            } else {
              this.hasMore = false;
            }
          } catch (error) {
            this.hasMore = false;
            console.error("Error loading more options:", error);
          } finally {
            this.isLoading = false;
          }
        }
        buildFloatingUI() {
          if (typeof FloatingUIDOM !== "undefined" && FloatingUIDOM.computePosition) {
            document.body.appendChild(this.dropdown);
            const reference = this.mode === "tags" ? this.wrapper : this.toggle;
            const middleware = [
              FloatingUIDOM.offset([0, 5])
            ];
            if (this.dropdownAutoPlacement && typeof FloatingUIDOM.flip === "function") {
              middleware.push(FloatingUIDOM.flip({
                fallbackPlacements: [
                  "bottom-start",
                  "bottom-end",
                  "top-start",
                  "top-end"
                ]
              }));
            }
            const options = {
              placement: POSITIONS[this.dropdownPlacement] || "bottom",
              strategy: "fixed",
              middleware
            };
            const update2 = () => {
              FloatingUIDOM.computePosition(reference, this.dropdown, options).then(
                ({ x, y, placement: computedPlacement }) => {
                  Object.assign(this.dropdown.style, {
                    position: "fixed",
                    left: `${x}px`,
                    top: `${y}px`,
                    [`margin${computedPlacement === "bottom" ? "Top" : computedPlacement === "top" ? "Bottom" : computedPlacement === "right" ? "Left" : "Right"}`]: `${this.dropdownSpace}px`
                  });
                  this.dropdown.setAttribute("data-placement", computedPlacement);
                }
              );
            };
            update2();
            const cleanup = FloatingUIDOM.autoUpdate(
              reference,
              this.dropdown,
              update2
            );
            this.floatingUIInstance = {
              update: update2,
              destroy: cleanup
            };
          } else {
            console.error("FloatingUIDOM not found! Please enable it on the page.");
          }
        }
        updateDropdownWidth() {
          const toggle = this.mode === "tags" ? this.wrapper : this.toggle;
          this.dropdown.style.width = `${toggle.clientWidth}px`;
        }
        buildSearch() {
          let input;
          this.searchWrapper = htmlToElement(
            this.searchWrapperTemplate || "<div></div>"
          );
          if (this.searchWrapperClasses) {
            classToClassList(this.searchWrapperClasses, this.searchWrapper);
          }
          input = this.searchWrapper.querySelector("[data-input]");
          const search = htmlToElement(
            this.searchTemplate || '<input type="text">'
          );
          this.search = search.tagName === "INPUT" ? search : search.querySelector(":scope input");
          this.search.placeholder = this.searchPlaceholder;
          if (this.searchClasses) classToClassList(this.searchClasses, this.search);
          if (this.searchId) this.search.id = this.searchId;
          this.onSearchInputListener = debounce(
            (evt) => this.searchInput(evt)
          );
          this.search.addEventListener("input", this.onSearchInputListener);
          if (input) input.append(search);
          else this.searchWrapper.append(search);
          this.dropdown.append(this.searchWrapper);
        }
        buildOption(title, val, disabled = false, selected = false, options, index = "1", id) {
          let template = null;
          let titleWrapper = null;
          let iconWrapper = null;
          let descriptionWrapper = null;
          const option = htmlToElement(this.optionTag || "<div></div>");
          option.setAttribute("data-value", val);
          option.setAttribute("data-title-value", title);
          option.setAttribute("tabIndex", index);
          option.classList.add("cursor-pointer");
          option.setAttribute("data-id", id || `${this.optionId}`);
          if (!id) this.optionId++;
          if (disabled) option.classList.add("disabled");
          if (selected) {
            if (this.isMultiple) this.value = [...this.value, val];
            else this.value = val;
          }
          if (this.optionTemplate) {
            template = htmlToElement(this.optionTemplate);
            option.append(template);
          }
          if (template) {
            titleWrapper = template.querySelector("[data-title]");
            titleWrapper.textContent = title || "";
          } else {
            option.textContent = title || "";
          }
          if (options) {
            if (options.icon) {
              const img = htmlToElement(this.apiIconTag ?? options.icon);
              img.classList.add("max-w-full");
              if (this.apiUrl) {
                img.setAttribute("alt", title);
                img.setAttribute("src", options.icon);
              }
              if (template) {
                iconWrapper = template.querySelector("[data-icon]");
                iconWrapper.append(img);
              } else {
                const icon = htmlToElement("<div></div>");
                if (this.iconClasses) classToClassList(this.iconClasses, icon);
                icon.append(img);
                option.append(icon);
              }
            }
            if (options.description) {
              if (template) {
                descriptionWrapper = template.querySelector("[data-description]");
                if (descriptionWrapper) {
                  descriptionWrapper.append(options.description);
                }
              } else {
                const description = htmlToElement("<div></div>");
                description.textContent = options.description;
                if (this.descriptionClasses) {
                  classToClassList(this.descriptionClasses, description);
                }
                option.append(description);
              }
            }
          }
          if (template && template.querySelector("[data-icon]") && !options && !options?.icon) {
            template.querySelector("[data-icon]").classList.add("hidden");
          }
          if (this.value && (this.isMultiple ? this.value.includes(val) : this.value === val)) {
            option.classList.add("selected");
          }
          if (!disabled) {
            option.addEventListener("click", () => this.onSelectOption(val));
          }
          if (this.optionClasses) classToClassList(this.optionClasses, option);
          if (this.dropdown) this.dropdown.append(option);
          if (selected) this.setNewValue();
        }
        buildOptionFromRemoteData(title, val, disabled = false, selected = false, index = "1", id, options) {
          if (index) {
            this.buildOption(title, val, disabled, selected, options, index, id);
          } else {
            alert(
              "ID parameter is required for generating remote options! Please check your API endpoint have it."
            );
          }
        }
        buildOptionsFromRemoteData(data) {
          data.forEach((el, i) => {
            let id = null;
            let title = "";
            let value = "";
            const options = {
              id: "",
              val: "",
              title: "",
              icon: null,
              description: null,
              rest: {}
            };
            Object.keys(el).forEach((key) => {
              if (el[this.apiFieldsMap.id]) id = el[this.apiFieldsMap.id];
              if (el[this.apiFieldsMap.val]) {
                value = `${el[this.apiFieldsMap.val]}`;
              }
              if (el[this.apiFieldsMap.title]) {
                title = el[this.apiFieldsMap.title];
                if (!el[this.apiFieldsMap.val]) {
                  value = title;
                }
              }
              if (el[this.apiFieldsMap.icon]) {
                options.icon = el[this.apiFieldsMap.icon];
              }
              if (el[this.apiFieldsMap?.description]) {
                options.description = el[this.apiFieldsMap.description];
              }
              options.rest[key] = el[key];
            });
            const existingOption = this.dropdown.querySelector(
              `[data-value="${value}"]`
            );
            if (!existingOption) {
              const isSelected = this.apiSelectedValues ? Array.isArray(this.apiSelectedValues) ? this.apiSelectedValues.includes(value) : this.apiSelectedValues === value : false;
              this.buildOriginalOption(
                title,
                value,
                id,
                false,
                isSelected,
                options
              );
              this.buildOptionFromRemoteData(
                title,
                value,
                false,
                isSelected,
                `${i}`,
                id,
                options
              );
              if (isSelected) {
                if (this.isMultiple) {
                  if (!this.value) this.value = [];
                  if (Array.isArray(this.value)) {
                    this.value = [...this.value, value];
                  }
                } else {
                  this.value = value;
                }
              }
            }
          });
          this.sortElements(this.el, "option");
          this.sortElements(this.dropdown, "[data-value]");
        }
        async optionsFromRemoteData(val = "") {
          const res = await this.apiRequest(val);
          this.remoteOptions = res;
          if (res.length) this.buildOptionsFromRemoteData(this.remoteOptions);
          else console.log("There is no data were responded!");
        }
        async apiRequest(val = "") {
          try {
            const url = new URL(this.apiUrl);
            const queryParams = new URLSearchParams(this.apiQuery ?? "");
            const options = this.apiOptions ?? {};
            const key = this.apiSearchQueryKey ?? "q";
            const trimmed = (val ?? "").trim().toLowerCase();
            if (trimmed !== "") queryParams.set(key, encodeURIComponent(trimmed));
            if (this.apiLoadMore) {
              const perPage = typeof this.apiLoadMore === "object" ? this.apiLoadMore.perPage : 10;
              const pageKey = this.apiFieldsMap?.page ?? this.apiFieldsMap?.offset ?? "page";
              const limitKey = this.apiFieldsMap?.limit ?? "limit";
              const isOffset = Boolean(this.apiFieldsMap?.offset);
              queryParams.delete(pageKey);
              queryParams.delete(limitKey);
              queryParams.set(pageKey, isOffset ? "0" : "1");
              queryParams.set(limitKey, String(perPage));
            }
            url.search = queryParams.toString();
            const res = await fetch(url.toString(), options);
            const json = await res.json();
            return this.apiDataPart ? json[this.apiDataPart] : json;
          } catch (err) {
            console.error(err);
          }
        }
        sortElements(container, selector) {
          const items = Array.from(container.querySelectorAll(selector));
          if (this.isSelectedOptionOnTop) {
            items.sort((a, b) => {
              const isASelected = a.classList.contains("selected") || a.hasAttribute("selected");
              const isBSelected = b.classList.contains("selected") || b.hasAttribute("selected");
              if (isASelected && !isBSelected) return -1;
              if (!isASelected && isBSelected) return 1;
              return 0;
            });
          }
          items.forEach((item) => container.appendChild(item));
        }
        async remoteSearch(val) {
          if (val.length <= this.minSearchLength) {
            const res2 = await this.apiRequest("");
            this.remoteOptions = res2;
            Array.from(this.dropdown.querySelectorAll("[data-value]")).forEach(
              (el) => el.remove()
            );
            Array.from(this.el.querySelectorAll("option[value]")).forEach(
              (el) => {
                el.remove();
              }
            );
            if (res2.length) this.buildOptionsFromRemoteData(res2);
            else console.log("No data responded!");
            return false;
          }
          const res = await this.apiRequest(val);
          this.remoteOptions = res;
          let newIds = res.map((item) => `${item.id}`);
          let restOptions = null;
          const pseudoOptions = this.dropdown.querySelectorAll("[data-value]");
          const options = this.el.querySelectorAll("[data-hs-select-option]");
          options.forEach((el) => {
            const dataId = el.getAttribute("data-id");
            if (!newIds.includes(dataId) && !this.value?.includes(el.value)) {
              this.destroyOriginalOption(el.value);
            }
          });
          pseudoOptions.forEach((el) => {
            const dataId = el.getAttribute("data-id");
            if (!newIds.includes(dataId) && !this.value?.includes(el.getAttribute("data-value"))) {
              this.destroyOption(el.getAttribute("data-value"));
            } else newIds = newIds.filter((item) => item !== dataId);
          });
          restOptions = res.filter(
            (item) => newIds.includes(`${item.id}`)
          );
          if (restOptions.length) this.buildOptionsFromRemoteData(restOptions);
          else console.log("No data responded!");
        }
        destroyOption(val) {
          const option = this.dropdown.querySelector(`[data-value="${val}"]`);
          if (!option) return false;
          option.remove();
        }
        buildOriginalOption(title, val, id, disabled, selected, options) {
          const option = htmlToElement("<option></option>");
          option.setAttribute("value", val);
          if (disabled) option.setAttribute("disabled", "disabled");
          if (selected) option.setAttribute("selected", "selected");
          if (id) option.setAttribute("data-id", id);
          option.setAttribute("data-hs-select-option", JSON.stringify(options));
          option.innerText = title;
          this.el.append(option);
        }
        destroyOriginalOption(val) {
          const option = this.el.querySelector(`[value="${val}"]`);
          if (!option) return false;
          option.remove();
        }
        buildTagsInputHelper() {
          this.tagsInputHelper = document.createElement("span");
          this.tagsInputHelper.style.fontSize = window.getComputedStyle(
            this.tagsInput
          ).fontSize;
          this.tagsInputHelper.style.fontFamily = window.getComputedStyle(
            this.tagsInput
          ).fontFamily;
          this.tagsInputHelper.style.fontWeight = window.getComputedStyle(
            this.tagsInput
          ).fontWeight;
          this.tagsInputHelper.style.letterSpacing = window.getComputedStyle(
            this.tagsInput
          ).letterSpacing;
          this.tagsInputHelper.style.visibility = "hidden";
          this.tagsInputHelper.style.whiteSpace = "pre";
          this.tagsInputHelper.style.position = "absolute";
          this.wrapper.appendChild(this.tagsInputHelper);
        }
        calculateInputWidth() {
          this.tagsInputHelper.textContent = this.tagsInput.value || this.tagsInput.placeholder;
          const inputPadding = parseInt(window.getComputedStyle(this.tagsInput).paddingLeft) + parseInt(window.getComputedStyle(this.tagsInput).paddingRight);
          const inputBorder = parseInt(window.getComputedStyle(this.tagsInput).borderLeftWidth) + parseInt(window.getComputedStyle(this.tagsInput).borderRightWidth);
          const newWidth = this.tagsInputHelper.offsetWidth + inputPadding + inputBorder;
          const maxWidth = this.wrapper.offsetWidth - (parseInt(window.getComputedStyle(this.wrapper).paddingLeft) + parseInt(window.getComputedStyle(this.wrapper).paddingRight));
          this.tagsInput.style.width = `${Math.min(newWidth, maxWidth) + 2}px`;
        }
        adjustInputWidth() {
          this.buildTagsInputHelper();
          this.calculateInputWidth();
        }
        onSelectOption(val) {
          this.clearSelections();
          if (this.isMultiple) {
            if (!Array.isArray(this.value)) this.value = [];
            this.value = this.value.includes(val) ? this.value.filter((el) => el !== val) : [...this.value, val];
            this.selectMultipleItems();
            this.setNewValue();
          } else {
            this.value = val;
            this.selectSingleItem();
            this.setNewValue();
          }
          this.fireEvent("change", this.value);
          if (this.mode === "tags") {
            const intersection = this.selectedItems.filter(
              (x) => !this.value.includes(x)
            );
            if (intersection.length) {
              intersection.forEach((el) => {
                this.selectedItems = this.selectedItems.filter((elI) => elI !== el);
                this.wrapper.querySelector(`[data-tag-value="${el}"]`).remove();
              });
            }
            this.resetTagsInputField();
          }
          if (!this.isMultiple) {
            if (this.toggle.querySelector("[data-icon]")) this.setToggleIcon();
            if (this.toggle.querySelector("[data-title]")) this.setToggleTitle();
            this.close(true);
          }
          if (!this.hasValue() && this.mode === "tags") {
            this.reassignTagsInputPlaceholder(this.placeholder);
          }
          if (this._isOpened && this.mode === "tags" && this.tagsInput) {
            this.tagsInput.focus();
          }
          this.triggerChangeEventForNativeSelect();
        }
        triggerChangeEventForNativeSelect() {
          const selectChangeEvent = new Event("change", { bubbles: true });
          this.el.dispatchEvent(selectChangeEvent);
          dispatch("change.hs.select", this.el, this.value);
        }
        addSelectOption(title, val, disabled, selected, options) {
          this.selectOptions = [
            ...this.selectOptions,
            {
              title,
              val,
              disabled,
              selected,
              options
            }
          ];
        }
        removeSelectOption(val, isArray2 = false) {
          const hasOption = !!this.selectOptions.some(
            (el) => el.val === val
          );
          if (!hasOption) return false;
          this.selectOptions = this.selectOptions.filter(
            (el) => el.val !== val
          );
          this.value = isArray2 ? this.value.filter((item) => item !== val) : val;
        }
        resetTagsInputField() {
          this.tagsInput.value = "";
          this.reassignTagsInputPlaceholder("");
          this.searchOptions("");
        }
        clearSelections() {
          Array.from(this.dropdown.children).forEach((el) => {
            if (el.classList.contains("selected")) el.classList.remove("selected");
          });
          Array.from(this.el.children).forEach((el) => {
            if (el.selected) {
              el.selected = false;
            }
          });
        }
        setNewValue() {
          if (this.mode === "tags") {
            this.setTagsItems();
          } else {
            if (this.optionAllowEmptyOption && this.value === "") {
              const emptyOption = this.selectOptions.find(
                (el) => el.val === ""
              );
              this.toggleTextWrapper.innerHTML = emptyOption?.title || this.placeholder;
            } else {
              if (this.hasValue()) {
                if (this.apiUrl) {
                  const selectedItem = this.dropdown.querySelector(
                    `[data-value="${this.value}"]`
                  );
                  if (selectedItem) {
                    this.toggleTextWrapper.innerHTML = selectedItem.getAttribute("data-title-value") || this.placeholder;
                  } else {
                    const selectedOption = this.remoteOptions.find(
                      (el) => {
                        const val = el[this.apiFieldsMap.val] ? `${el[this.apiFieldsMap.val]}` : el[this.apiFieldsMap.title];
                        return val === this.value;
                      }
                    );
                    this.toggleTextWrapper.innerHTML = selectedOption ? `${selectedOption[this.apiFieldsMap.title]}` : this.stringFromValue();
                  }
                } else {
                  this.toggleTextWrapper.innerHTML = this.stringFromValue();
                }
              } else {
                this.toggleTextWrapper.innerHTML = this.placeholder;
              }
            }
          }
        }
        stringFromValueBasic(options) {
          const value = [];
          let title = "";
          options.forEach((el) => {
            if (this.isMultiple) {
              if (Array.isArray(this.value) && this.value.includes(el.val)) {
                value.push(el.title);
              }
            } else {
              if (this.value === el.val) value.push(el.title);
            }
          });
          if (this.toggleCountText !== void 0 && this.toggleCountText !== null && value.length >= this.toggleCountTextMinItems) {
            if (this.toggleCountTextMode === "nItemsAndCount") {
              const nItems = value.slice(0, this.toggleCountTextMinItems - 1);
              const tempTitle = [nItems.join(this.toggleSeparators.items)];
              const count = `${value.length - nItems.length}`;
              if (this?.toggleSeparators?.betweenItemsAndCounter) {
                tempTitle.push(this.toggleSeparators.betweenItemsAndCounter);
              }
              if (this.toggleCountText) {
                switch (this.toggleCountTextPlacement) {
                  case "postfix-no-space":
                    tempTitle.push(`${count}${this.toggleCountText}`);
                    break;
                  case "prefix-no-space":
                    tempTitle.push(`${this.toggleCountText}${count}`);
                    break;
                  case "prefix":
                    tempTitle.push(`${this.toggleCountText} ${count}`);
                    break;
                  default:
                    tempTitle.push(`${count} ${this.toggleCountText}`);
                    break;
                }
              }
              title = tempTitle.join(" ");
            } else {
              title = `${value.length} ${this.toggleCountText}`;
            }
          } else {
            title = value.join(this.toggleSeparators.items);
          }
          return title;
        }
        stringFromValueRemoteData() {
          const options = this.dropdown.querySelectorAll("[data-title-value]");
          const value = [];
          let title = "";
          options.forEach((el) => {
            const dataValue = el.getAttribute("data-value");
            const dataTitleValue = el.getAttribute("data-title-value");
            if (this.isMultiple) {
              if (Array.isArray(this.value) && this.value.includes(dataValue)) {
                value.push(dataTitleValue);
              }
            } else {
              if (this.value === dataValue) value.push(dataTitleValue);
            }
          });
          if (this.toggleCountText && this.toggleCountText !== "" && value.length >= this.toggleCountTextMinItems) {
            if (this.toggleCountTextMode === "nItemsAndCount") {
              const nItems = value.slice(0, this.toggleCountTextMinItems - 1);
              title = `${nItems.join(this.toggleSeparators.items)} ${this.toggleSeparators.betweenItemsAndCounter} ${value.length - nItems.length} ${this.toggleCountText}`;
            } else {
              title = `${value.length} ${this.toggleCountText}`;
            }
          } else {
            title = value.join(this.toggleSeparators.items);
          }
          return title;
        }
        stringFromValue() {
          const result = this.apiUrl ? this.stringFromValueRemoteData() : this.stringFromValueBasic(this.selectOptions);
          return result;
        }
        selectSingleItem() {
          const selectedOption = Array.from(this.el.children).find(
            (el) => this.value === el.value
          );
          selectedOption.selected = true;
          const selectedItem = Array.from(this.dropdown.children).find(
            (el) => this.value === el.getAttribute("data-value")
          );
          if (selectedItem) selectedItem.classList.add("selected");
          this.sortElements(this.el, "option");
          this.sortElements(this.dropdown, "[data-value]");
        }
        selectMultipleItems() {
          if (!Array.isArray(this.value)) return;
          Array.from(this.dropdown.children).filter((el) => this.value.includes(el.getAttribute("data-value"))).forEach((el) => el.classList.add("selected"));
          Array.from(this.el.children).filter((el) => this.value.includes(el.value)).forEach((el) => el.selected = true);
          this.sortElements(this.el, "option");
          this.sortElements(this.dropdown, "[data-value]");
        }
        unselectMultipleItems() {
          Array.from(this.dropdown.children).forEach(
            (el) => el.classList.remove("selected")
          );
          Array.from(this.el.children).forEach(
            (el) => el.selected = false
          );
          this.sortElements(this.el, "option");
          this.sortElements(this.dropdown, "[data-value]");
        }
        searchOptions(val) {
          if (val.length <= this.minSearchLength) {
            if (this.searchNoResult) {
              this.searchNoResult.remove();
              this.searchNoResult = null;
            }
            const options2 = this.dropdown.querySelectorAll("[data-value]");
            options2.forEach((el) => {
              el.classList.remove("hidden");
            });
            return false;
          }
          if (this.searchNoResult) {
            this.searchNoResult.remove();
            this.searchNoResult = null;
          }
          this.searchNoResult = htmlToElement(this.searchNoResultTemplate);
          this.searchNoResult.innerText = this.searchNoResultText;
          classToClassList(this.searchNoResultClasses, this.searchNoResult);
          const options = this.dropdown.querySelectorAll("[data-value]");
          let hasItems = false;
          let countLimit;
          if (this.searchLimit) countLimit = 0;
          options.forEach((el) => {
            const optionVal = el.getAttribute("data-title-value").toLocaleLowerCase();
            const directMatch = this.isSearchDirectMatch;
            let condition;
            if (directMatch) {
              condition = !optionVal.includes(val.toLowerCase()) || this.searchLimit && countLimit >= this.searchLimit;
            } else {
              const regexSafeVal = val ? val.split("").map((char) => /\w/.test(char) ? `${char}[\\W_]*` : "\\W*").join("") : "";
              const regex = new RegExp(regexSafeVal, "i");
              condition = !regex.test(optionVal.trim()) || this.searchLimit && countLimit >= this.searchLimit;
            }
            if (condition) {
              el.classList.add("hidden");
            } else {
              el.classList.remove("hidden");
              hasItems = true;
              if (this.searchLimit) countLimit++;
            }
          });
          if (!hasItems) this.dropdown.append(this.searchNoResult);
        }
        eraseToggleIcon() {
          const icon = this.toggle.querySelector("[data-icon]");
          if (icon) {
            icon.innerHTML = null;
            icon.classList.add("hidden");
          }
        }
        eraseToggleTitle() {
          const title = this.toggle.querySelector("[data-title]");
          if (title) {
            title.innerHTML = this.placeholder;
          } else {
            this.toggleTextWrapper.innerHTML = this.placeholder;
          }
        }
        toggleFn() {
          if (this._isOpened) this.close();
          else this.open();
        }
        // Accessibility methods
        setupAccessibility() {
          this.accessibilityComponent = window.HSAccessibilityObserver.registerComponent(
            this.wrapper,
            {
              onEnter: () => {
                if (!this._isOpened) {
                  this.open();
                } else {
                  const highlighted = this.dropdown.querySelector(
                    ".hs-select-option-highlighted"
                  );
                  if (highlighted) {
                    this.onSelectOption(
                      highlighted.getAttribute("data-value") || ""
                    );
                    if (this._isOpened) {
                      highlighted.focus();
                    }
                  }
                }
              },
              onSpace: () => {
                if (!this._isOpened) {
                  this.open();
                } else {
                  const highlighted = this.dropdown.querySelector(
                    ".hs-select-option-highlighted"
                  );
                  if (highlighted) {
                    this.onSelectOption(
                      highlighted.getAttribute("data-value") || ""
                    );
                    if (this._isOpened) {
                      highlighted.focus();
                    }
                  }
                }
              },
              onEsc: () => {
                if (this._isOpened) {
                  this.close(true);
                }
              },
              onArrow: (evt) => {
                if (evt.metaKey) return;
                if (!this._isOpened && evt.key === "ArrowDown") {
                  this.open();
                  return;
                }
                if (this._isOpened) {
                  switch (evt.key) {
                    case "ArrowDown":
                      this.focusMenuItem("next");
                      break;
                    case "ArrowUp":
                      this.focusMenuItem("prev");
                      break;
                    case "Home":
                      this.onStartEnd(true);
                      break;
                    case "End":
                      this.onStartEnd(false);
                      break;
                  }
                }
              },
              onHome: () => {
                if (this._isOpened) this.onStartEnd(true);
              },
              onEnd: () => {
                if (this._isOpened) this.onStartEnd(false);
              },
              onTab: () => {
                if (this._isOpened) this.close();
              }
            },
            this._isOpened,
            "Select",
            ".hs-select",
            this.dropdown
          );
        }
        focusMenuItem(direction) {
          const options = Array.from(
            this.dropdown.querySelectorAll(":scope > *:not(.hidden)")
          ).filter(
            (el) => !el.classList.contains("disabled")
          );
          if (!options.length) return;
          const current = this.dropdown.querySelector(
            ".hs-select-option-highlighted"
          );
          const currentIndex = current ? options.indexOf(current) : -1;
          const nextIndex = direction === "next" ? (currentIndex + 1) % options.length : (currentIndex - 1 + options.length) % options.length;
          if (current) current.classList.remove("hs-select-option-highlighted");
          options[nextIndex].classList.add("hs-select-option-highlighted");
          options[nextIndex].focus();
        }
        onStartEnd(isStart = true) {
          if (!this.dropdown) return;
          const options = Array.from(
            this.dropdown.querySelectorAll(":scope > *:not(.hidden)")
          ).filter(
            (el) => !el.classList.contains("disabled")
          );
          if (!options.length) return;
          const current = this.dropdown.querySelector(
            ".hs-select-option-highlighted"
          );
          if (current) current.classList.remove("hs-select-option-highlighted");
          const index = isStart ? 0 : options.length - 1;
          options[index].classList.add("hs-select-option-highlighted");
          options[index].focus();
        }
        // Public methods
        destroy() {
          if (this.wrapper) {
            this.wrapper.removeEventListener("click", this.onWrapperClickListener);
          }
          if (this.toggle) {
            this.toggle.removeEventListener("click", this.onToggleClickListener);
          }
          if (this.tagsInput) {
            this.tagsInput.removeEventListener(
              "focus",
              this.onTagsInputFocusListener
            );
            this.tagsInput.removeEventListener(
              "input",
              this.onTagsInputInputListener
            );
            this.tagsInput.removeEventListener(
              "input",
              this.onTagsInputInputSecondListener
            );
            this.tagsInput.removeEventListener(
              "keydown",
              this.onTagsInputKeydownListener
            );
          }
          if (this.search) {
            this.search.removeEventListener("input", this.onSearchInputListener);
          }
          const parent = this.el.parentElement.parentElement;
          this.el.classList.add("hidden");
          this.el.style.display = "";
          parent.prepend(this.el);
          parent.querySelector(".hs-select").remove();
          this.wrapper = null;
          this.disabledObserver?.disconnect();
          this.disabledObserver = null;
          window.$hsSelectCollection = window.$hsSelectCollection.filter(
            ({ element }) => element.el !== this.el
          );
        }
        open() {
          const currentlyOpened = window?.$hsSelectCollection?.find((el) => el.element.isOpened()) || null;
          if (currentlyOpened) currentlyOpened.element.close();
          if (this.animationInProcess) return false;
          this.animationInProcess = true;
          if (this.dropdownScope === "window") {
            this.dropdown.classList.add("invisible");
          }
          this.dropdown.classList.remove("hidden");
          if (this.dropdownScope !== "window") this.recalculateDirection();
          setTimeout(() => {
            if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
            this.wrapper.classList.add("active");
            this.dropdown.classList.add("opened");
            if (this.dropdown.classList.contains("w-full") && this.dropdownScope === "window") {
              this.updateDropdownWidth();
            }
            if (this.floatingUIInstance && this.dropdownScope === "window") {
              this.floatingUIInstance.update();
              this.dropdown.classList.remove("invisible");
            }
            if (this.hasSearch && !this.preventSearchFocus) this.search.focus();
            this.animationInProcess = false;
          });
          this._isOpened = true;
          if (window.HSAccessibilityObserver && this.accessibilityComponent) {
            window.HSAccessibilityObserver.updateComponentState(
              this.accessibilityComponent,
              this._isOpened
            );
          }
        }
        close(forceFocus = false) {
          if (this.animationInProcess) return false;
          this.animationInProcess = true;
          if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
          this.wrapper.classList.remove("active");
          this.dropdown.classList.remove("opened", "bottom-full", "top-full");
          if (this.dropdownDirectionClasses?.bottom) {
            this.dropdown.classList.remove(this.dropdownDirectionClasses.bottom);
          }
          if (this.dropdownDirectionClasses?.top) {
            this.dropdown.classList.remove(this.dropdownDirectionClasses.top);
          }
          this.dropdown.style.marginTop = "";
          this.dropdown.style.marginBottom = "";
          afterTransition(this.dropdown, () => {
            this.dropdown.classList.add("hidden");
            if (this.hasSearch) {
              this.search.value = "";
              if (!this.apiUrl) {
                this.search.dispatchEvent(new Event("input", { bubbles: true }));
              }
              this.search.blur();
            }
            if (forceFocus) {
              if (this.mode?.includes("tags")) this.wrapper.focus();
              else this.toggle.focus();
            }
            this.animationInProcess = false;
          });
          this.dropdown.querySelector(".hs-select-option-highlighted")?.classList.remove("hs-select-option-highlighted");
          this._isOpened = false;
          if (window.HSAccessibilityObserver && this.accessibilityComponent) {
            window.HSAccessibilityObserver.updateComponentState(
              this.accessibilityComponent,
              this._isOpened
            );
          }
        }
        addOption(items) {
          let i = `${this.selectOptions.length}`;
          const addOption = (option) => {
            const { title, val, disabled, selected, options } = option;
            const hasOption = !!this.selectOptions.some(
              (el) => el.val === val
            );
            if (!hasOption) {
              this.addSelectOption(title, val, disabled, selected, options);
              this.buildOption(title, val, disabled, selected, options, i);
              this.buildOriginalOption(title, val, null, disabled, selected, options);
              if (selected && !this.isMultiple) this.onSelectOption(val);
            }
          };
          if (Array.isArray(items)) {
            items.forEach((option) => {
              addOption(option);
            });
          } else {
            addOption(items);
          }
          this.sortElements(this.el, "option");
          this.sortElements(this.dropdown, "[data-value]");
        }
        removeOption(values) {
          const removeOption = (val, isArray2 = false) => {
            const hasOption = !!this.selectOptions.some(
              (el) => el.val === val
            );
            if (hasOption) {
              this.removeSelectOption(val, isArray2);
              this.destroyOption(val);
              this.destroyOriginalOption(val);
              if (this.value === val) {
                this.value = null;
                this.eraseToggleTitle();
                this.eraseToggleIcon();
              }
            }
          };
          if (Array.isArray(values)) {
            values.forEach((val) => {
              removeOption(val, this.isMultiple);
            });
          } else {
            removeOption(values, this.isMultiple);
          }
          this.setNewValue();
          this.sortElements(this.el, "option");
          this.sortElements(this.dropdown, "[data-value]");
        }
        recalculateDirection() {
          if (this?.dropdownVerticalFixedPlacement && (this.dropdown.classList.contains("bottom-full") || this.dropdown.classList.contains("top-full"))) return false;
          if (this?.dropdownVerticalFixedPlacement === "top") {
            this.dropdown.classList.add("bottom-full");
            this.dropdown.style.marginBottom = `${this.dropdownSpace}px`;
          } else if (this?.dropdownVerticalFixedPlacement === "bottom") {
            this.dropdown.classList.add("top-full");
            this.dropdown.style.marginTop = `${this.dropdownSpace}px`;
          } else if (isEnoughSpace(
            this.dropdown,
            this.toggle || this.tagsInput,
            "bottom",
            this.dropdownSpace,
            this.viewport
          )) {
            this.dropdown.classList.remove("bottom-full");
            if (this.dropdownDirectionClasses?.bottom) {
              this.dropdown.classList.remove(this.dropdownDirectionClasses.bottom);
            }
            this.dropdown.style.marginBottom = "";
            this.dropdown.classList.add("top-full");
            if (this.dropdownDirectionClasses?.top) {
              this.dropdown.classList.add(this.dropdownDirectionClasses.top);
            }
            this.dropdown.style.marginTop = `${this.dropdownSpace}px`;
          } else {
            this.dropdown.classList.remove("top-full");
            if (this.dropdownDirectionClasses?.top) {
              this.dropdown.classList.remove(this.dropdownDirectionClasses.top);
            }
            this.dropdown.style.marginTop = "";
            this.dropdown.classList.add("bottom-full");
            if (this.dropdownDirectionClasses?.bottom) {
              this.dropdown.classList.add(this.dropdownDirectionClasses.bottom);
            }
            this.dropdown.style.marginBottom = `${this.dropdownSpace}px`;
          }
        }
        isOpened() {
          return this._isOpened || false;
        }
        containsElement(element) {
          return this.wrapper?.contains(element) || false;
        }
        // Static methods
        static findInCollection(target) {
          return window.$hsSelectCollection.find((el) => {
            if (target instanceof _HSSelect) return el.element.el === target.el;
            else if (typeof target === "string") {
              return el.element.el === document.querySelector(target);
            } else return el.element.el === target;
          }) || null;
        }
        static getInstance(target, isInstance) {
          const elInCollection = window.$hsSelectCollection.find(
            (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
          );
          return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
        }
        static autoInit() {
          if (!window.$hsSelectCollection) {
            window.$hsSelectCollection = [];
            window.addEventListener("click", (evt) => {
              const evtTarget = evt.target;
              _HSSelect.closeCurrentlyOpened(evtTarget);
            });
          }
          if (window.$hsSelectCollection) {
            window.$hsSelectCollection = window.$hsSelectCollection.filter(
              ({ element }) => document.contains(element.el)
            );
          }
          document.querySelectorAll("[data-hs-select]:not(.--prevent-on-load-init)").forEach((el) => {
            if (!window.$hsSelectCollection.find(
              (elC) => elC?.element?.el === el
            )) {
              const data = el.getAttribute("data-hs-select");
              const options = data ? JSON.parse(data) : {};
              new _HSSelect(el, options);
            }
          });
        }
        static open(target) {
          const instance = _HSSelect.findInCollection(target);
          if (instance && !instance.element.isOpened()) instance.element.open();
        }
        static close(target) {
          const instance = _HSSelect.findInCollection(target);
          if (instance && instance.element.isOpened()) instance.element.close();
        }
        static closeCurrentlyOpened(evtTarget = null) {
          if (!evtTarget.closest(".hs-select.active") && !evtTarget.closest("[data-hs-select-dropdown].opened")) {
            const currentlyOpened = window.$hsSelectCollection.filter(
              (el) => el.element.isOpened()
            ) || null;
            if (currentlyOpened) {
              currentlyOpened.forEach((el) => {
                el.element.close();
              });
            }
          }
        }
      };
      window.addEventListener("load", () => {
        HSSelect.autoInit();
      });
      document.addEventListener("scroll", () => {
        if (!window.$hsSelectCollection) return false;
        const target = window.$hsSelectCollection.find((el) => el.element.isOpened());
        if (target) target.element.recalculateDirection();
      });
      if (typeof window !== "undefined") {
        window.HSSelect = HSSelect;
      }
      select_default = HSSelect;
    }
  });

  // node_modules/preline/src/plugins/datatable/index.ts
  var datatable_exports = {};
  __export(datatable_exports, {
    default: () => datatable_default
  });
  var HSDataTable, datatable_default;
  var init_datatable = __esm({
    "node_modules/preline/src/plugins/datatable/index.ts"() {
      init_utils();
      init_base_plugin();
      HSDataTable = class _HSDataTable extends HSBasePlugin {
        concatOptions;
        dataTable;
        table;
        searches;
        pageEntitiesList;
        pagingList;
        pagingPagesList;
        pagingPrevList;
        pagingNextList;
        infoList;
        rowSelectingAll;
        rowSelectingIndividual;
        maxPagesToShow;
        isRowSelecting;
        pageBtnClasses;
        onSearchInputListener;
        onPageEntitiesChangeListener;
        onSinglePagingClickListener;
        onPagingPrevClickListener;
        onPagingNextClickListener;
        onRowSelectingAllChangeListener;
        constructor(el, options, events) {
          super(el, options, events);
          this.el = typeof el === "string" ? document.querySelector(el) : el;
          const columnDefs = [];
          Array.from(this.el.querySelectorAll("thead th, thead td")).forEach(
            (th, ind) => {
              if (th.classList.contains("--exclude-from-ordering"))
                columnDefs.push({
                  targets: ind,
                  orderable: false
                });
            }
          );
          const data = this.el.getAttribute("data-hs-datatable");
          const dataOptions = data ? JSON.parse(data) : {};
          this.concatOptions = {
            searching: true,
            lengthChange: false,
            order: [],
            columnDefs: [...columnDefs],
            ...dataOptions,
            ...options
          };
          this.table = this.el.querySelector("table");
          this.searches = Array.from(this.el.querySelectorAll("[data-hs-datatable-search]")) ?? null;
          this.pageEntitiesList = Array.from(this.el.querySelectorAll("[data-hs-datatable-page-entities]")) ?? null;
          this.pagingList = Array.from(this.el.querySelectorAll("[data-hs-datatable-paging]")) ?? null;
          this.pagingPagesList = Array.from(this.el.querySelectorAll("[data-hs-datatable-paging-pages]")) ?? null;
          this.pagingPrevList = Array.from(this.el.querySelectorAll("[data-hs-datatable-paging-prev]")) ?? null;
          this.pagingNextList = Array.from(this.el.querySelectorAll("[data-hs-datatable-paging-next]")) ?? null;
          this.infoList = Array.from(this.el.querySelectorAll("[data-hs-datatable-info]")) ?? null;
          if (this.concatOptions?.rowSelectingOptions)
            this.rowSelectingAll = (this.concatOptions?.rowSelectingOptions?.selectAllSelector ? document.querySelector(
              this.concatOptions?.rowSelectingOptions?.selectAllSelector
            ) : document.querySelector("[data-hs-datatable-row-selecting-all]")) ?? null;
          if (this.concatOptions?.rowSelectingOptions)
            this.rowSelectingIndividual = this.concatOptions?.rowSelectingOptions?.individualSelector ?? "[data-hs-datatable-row-selecting-individual]";
          if (this.pageEntitiesList.length) this.concatOptions.pageLength = parseInt(this.pageEntitiesList[0].value);
          this.maxPagesToShow = 3;
          this.isRowSelecting = !!this.concatOptions?.rowSelectingOptions;
          this.pageBtnClasses = this.concatOptions?.pagingOptions?.pageBtnClasses ?? null;
          this.onSearchInputListener = [];
          this.onPageEntitiesChangeListener = [];
          this.onSinglePagingClickListener = [];
          this.onPagingPrevClickListener = [];
          this.onPagingNextClickListener = [];
          this.init();
        }
        init() {
          this.createCollection(window.$hsDataTableCollection, this);
          this.initTable();
          if (this.searches.length) this.initSearch();
          if (this.pageEntitiesList.length) this.initPageEntities();
          if (this.pagingList.length) this.initPaging();
          if (this.pagingPagesList.length) this.buildPagingPages();
          if (this.pagingPrevList.length) this.initPagingPrev();
          if (this.pagingNextList.length) this.initPagingNext();
          if (this.infoList.length) this.initInfo();
          if (this.isRowSelecting) this.initRowSelecting();
        }
        initTable() {
          this.dataTable = new DataTable(this.table, this.concatOptions);
          if (this.isRowSelecting) this.triggerChangeEventToRow();
          this.dataTable.on("draw", () => {
            if (this.isRowSelecting) this.updateSelectAllCheckbox();
            if (this.isRowSelecting) this.triggerChangeEventToRow();
            this.updateInfo();
            this.pagingPagesList.forEach((el) => this.updatePaging(el));
          });
        }
        searchInput(evt) {
          this.onSearchInput(evt.target.value);
        }
        pageEntitiesChange(evt) {
          this.onEntitiesChange(parseInt(evt.target.value), evt.target);
        }
        pagingPrevClick() {
          this.onPrevClick();
        }
        pagingNextClick() {
          this.onNextClick();
        }
        rowSelectingAllChange() {
          this.onSelectAllChange();
        }
        singlePagingClick(count) {
          this.onPageClick(count);
        }
        // Search
        initSearch() {
          this.searches.forEach((el) => {
            this.onSearchInputListener.push({
              el,
              fn: debounce((evt) => this.searchInput(evt))
            });
            el.addEventListener("input", this.onSearchInputListener.find((search) => search.el === el).fn);
          });
        }
        onSearchInput(val) {
          this.dataTable.search(val).draw();
        }
        // Page entities
        initPageEntities() {
          this.pageEntitiesList.forEach((el) => {
            this.onPageEntitiesChangeListener.push({
              el,
              fn: (evt) => this.pageEntitiesChange(evt)
            });
            el.addEventListener("change", this.onPageEntitiesChangeListener.find((pageEntity) => pageEntity.el === el).fn);
          });
        }
        onEntitiesChange(entities, target) {
          const otherEntities = this.pageEntitiesList.filter((el) => el !== target);
          if (otherEntities.length) otherEntities.forEach((el) => {
            if (window.HSSelect) {
              const hsSelectInstance = window.HSSelect.getInstance(el, true);
              if (hsSelectInstance) hsSelectInstance.element.setValue(`${entities}`);
            } else el.value = `${entities}`;
          });
          this.dataTable.page.len(entities).draw();
        }
        // Info
        initInfo() {
          this.infoList.forEach((el) => {
            this.initInfoFrom(el);
            this.initInfoTo(el);
            this.initInfoLength(el);
          });
        }
        initInfoFrom(el) {
          const infoFrom = el.querySelector("[data-hs-datatable-info-from]") ?? null;
          const { start } = this.dataTable.page.info();
          if (infoFrom) infoFrom.innerText = `${start + 1}`;
        }
        initInfoTo(el) {
          const infoTo = el.querySelector("[data-hs-datatable-info-to]") ?? null;
          const { end } = this.dataTable.page.info();
          if (infoTo) infoTo.innerText = `${end}`;
        }
        initInfoLength(el) {
          const infoLength = el.querySelector("[data-hs-datatable-info-length]") ?? null;
          const { recordsTotal } = this.dataTable.page.info();
          if (infoLength) infoLength.innerText = `${recordsTotal}`;
        }
        updateInfo() {
          this.initInfo();
        }
        // Paging
        initPaging() {
          this.pagingList.forEach((el) => this.hidePagingIfSinglePage(el));
        }
        hidePagingIfSinglePage(el) {
          const { pages } = this.dataTable.page.info();
          if (pages < 2) {
            el.classList.add("hidden");
            el.style.display = "none";
          } else {
            el.classList.remove("hidden");
            el.style.display = "";
          }
        }
        initPagingPrev() {
          this.pagingPrevList.forEach((el) => {
            this.onPagingPrevClickListener.push({
              el,
              fn: () => this.pagingPrevClick()
            });
            el.addEventListener("click", this.onPagingPrevClickListener.find((pagingPrev) => pagingPrev.el === el).fn);
          });
        }
        onPrevClick() {
          this.dataTable.page("previous").draw("page");
        }
        disablePagingArrow(el, statement) {
          if (statement) {
            el.classList.add("disabled");
            el.setAttribute("disabled", "disabled");
          } else {
            el.classList.remove("disabled");
            el.removeAttribute("disabled");
          }
        }
        initPagingNext() {
          this.pagingNextList.forEach((el) => {
            this.onPagingNextClickListener.push({
              el,
              fn: () => this.pagingNextClick()
            });
            el.addEventListener("click", this.onPagingNextClickListener.find((pagingNext) => pagingNext.el === el).fn);
          });
        }
        onNextClick() {
          this.dataTable.page("next").draw("page");
        }
        buildPagingPages() {
          this.pagingPagesList.forEach((el) => this.updatePaging(el));
        }
        updatePaging(pagingPages) {
          const { page, pages, length } = this.dataTable.page.info();
          const totalRecords = this.dataTable.rows({ search: "applied" }).count();
          const totalPages = Math.ceil(totalRecords / length);
          const currentPage = page + 1;
          let startPage = Math.max(1, currentPage - Math.floor(this.maxPagesToShow / 2));
          let endPage = Math.min(totalPages, startPage + (this.maxPagesToShow - 1));
          if (endPage - startPage + 1 < this.maxPagesToShow) {
            startPage = Math.max(1, endPage - this.maxPagesToShow + 1);
          }
          pagingPages.innerHTML = "";
          if (startPage > 1) {
            this.buildPagingPage(1, pagingPages);
            if (startPage > 2) pagingPages.appendChild(htmlToElement(`<span class="ellipsis">...</span>`));
          }
          for (let i = startPage; i <= endPage; i++) {
            this.buildPagingPage(i, pagingPages);
          }
          if (endPage < totalPages) {
            if (endPage < totalPages - 1) pagingPages.appendChild(htmlToElement(`<span class="ellipsis">...</span>`));
            this.buildPagingPage(totalPages, pagingPages);
          }
          this.pagingPrevList.forEach((el) => this.disablePagingArrow(el, page === 0));
          this.pagingNextList.forEach((el) => this.disablePagingArrow(el, page === pages - 1));
          this.pagingList.forEach((el) => this.hidePagingIfSinglePage(el));
        }
        buildPagingPage(counter, target) {
          const { page } = this.dataTable.page.info();
          const pageEl = htmlToElement(`<button type="button"></button>`);
          pageEl.innerText = `${counter}`;
          pageEl.setAttribute("data-page", `${counter}`);
          if (this.pageBtnClasses) classToClassList(this.pageBtnClasses, pageEl);
          if (page === counter - 1) pageEl.classList.add("active");
          this.onSinglePagingClickListener.push({
            el: pageEl,
            fn: () => this.singlePagingClick(counter)
          });
          pageEl.addEventListener("click", this.onSinglePagingClickListener.find((singlePaging) => singlePaging.el === pageEl).fn);
          target.append(pageEl);
        }
        onPageClick(counter) {
          this.dataTable.page(counter - 1).draw("page");
        }
        // Select row
        initRowSelecting() {
          this.onRowSelectingAllChangeListener = () => this.rowSelectingAllChange();
          this.rowSelectingAll.addEventListener(
            "change",
            this.onRowSelectingAllChangeListener
          );
        }
        triggerChangeEventToRow() {
          this.table.querySelectorAll(`tbody ${this.rowSelectingIndividual}`).forEach((el) => {
            el.addEventListener("change", () => {
              this.updateSelectAllCheckbox();
            });
          });
        }
        onSelectAllChange() {
          let isChecked = this.rowSelectingAll.checked;
          const visibleRows = Array.from(
            this.dataTable.rows({ page: "current", search: "applied" }).nodes()
          );
          visibleRows.forEach((el) => {
            const checkbox = el.querySelector(this.rowSelectingIndividual);
            if (checkbox) checkbox.checked = isChecked;
          });
          this.updateSelectAllCheckbox();
        }
        updateSelectAllCheckbox() {
          const searchRelatedItems = this.dataTable.rows({ search: "applied" }).count();
          if (!searchRelatedItems) {
            this.rowSelectingAll.checked = false;
            return false;
          }
          let isChecked = true;
          const visibleRows = Array.from(
            this.dataTable.rows({
              page: "current",
              search: "applied"
            }).nodes()
          );
          visibleRows.forEach((el) => {
            const checkbox = el.querySelector(this.rowSelectingIndividual);
            if (checkbox && !checkbox.checked) {
              isChecked = false;
              return false;
            }
          });
          this.rowSelectingAll.checked = isChecked;
        }
        // Public methods
        destroy() {
          if (this.searches) {
            this.onSearchInputListener.forEach(({ el, fn }) => el.removeEventListener("click", fn));
          }
          if (this.pageEntitiesList) this.onPageEntitiesChangeListener.forEach(({ el, fn }) => el.removeEventListener("change", fn));
          if (this.pagingPagesList.length) {
            this.onSinglePagingClickListener.forEach(({ el, fn }) => el.removeEventListener("click", fn));
            this.pagingPagesList.forEach((el) => el.innerHTML = "");
          }
          if (this.pagingPrevList.length) this.onPagingPrevClickListener.forEach(({ el, fn }) => el.removeEventListener("click", fn));
          if (this.pagingNextList.length) this.onPagingNextClickListener.forEach(({ el, fn }) => el.removeEventListener("click", fn));
          if (this.rowSelectingAll)
            this.rowSelectingAll.removeEventListener(
              "change",
              this.onRowSelectingAllChangeListener
            );
          this.dataTable.destroy();
          this.rowSelectingAll = null;
          this.rowSelectingIndividual = null;
          window.$hsDataTableCollection = window.$hsDataTableCollection.filter(({ element }) => element.el !== this.el);
        }
        // Static methods
        static getInstance(target, isInstance) {
          const elInCollection = window.$hsDataTableCollection.find(
            (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
          );
          return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
        }
        static autoInit() {
          if (!window.$hsDataTableCollection) window.$hsDataTableCollection = [];
          if (window.$hsDataTableCollection)
            window.$hsDataTableCollection = window.$hsDataTableCollection.filter(
              ({ element }) => document.contains(element.el)
            );
          document.querySelectorAll("[data-hs-datatable]:not(.--prevent-on-load-init)").forEach((el) => {
            if (!window.$hsDataTableCollection.find(
              (elC) => elC?.element?.el === el
            ))
              new _HSDataTable(el);
          });
        }
      };
      window.addEventListener("load", () => {
        if (document.querySelectorAll(
          "[data-hs-datatable]:not(.--prevent-on-load-init)"
        ).length) {
          if (typeof jQuery === "undefined")
            console.error(
              "HSDataTable: jQuery is not available, please add it to the page."
            );
          if (typeof DataTable === "undefined")
            console.error(
              "HSDataTable: DataTable is not available, please add it to the page."
            );
        }
        if (typeof DataTable !== "undefined" && typeof jQuery !== "undefined")
          HSDataTable.autoInit();
      });
      if (typeof window !== "undefined") {
        window.HSDataTable = HSDataTable;
      }
      datatable_default = HSDataTable;
    }
  });

  // node_modules/preline/src/plugins/file-upload/index.ts
  var file_upload_exports = {};
  __export(file_upload_exports, {
    default: () => file_upload_default
  });
  var HSFileUpload, file_upload_default;
  var init_file_upload = __esm({
    "node_modules/preline/src/plugins/file-upload/index.ts"() {
      init_utils();
      init_base_plugin();
      if (typeof Dropzone !== "undefined") Dropzone.autoDiscover = false;
      HSFileUpload = class _HSFileUpload extends HSBasePlugin {
        concatOptions;
        previewTemplate;
        extensions = {};
        singleton;
        dropzone;
        onReloadButtonClickListener;
        onTempFileInputChangeListener;
        constructor(el, options, events) {
          super(el, options, events);
          this.el = typeof el === "string" ? document.querySelector(el) : el;
          const data = this.el.getAttribute("data-hs-file-upload");
          const dataOptions = data ? JSON.parse(data) : {};
          this.previewTemplate = this.el.querySelector("[data-hs-file-upload-preview]")?.innerHTML || `<div class="p-3 bg-white border border-solid border-gray-300 rounded-xl dark:bg-neutral-800 dark:border-neutral-600">
			<div class="mb-2 flex justify-between items-center">
				<div class="flex items-center gap-x-3">
					<span class="size-8 flex justify-center items-center border border-gray-200 text-gray-500 rounded-lg dark:border-neutral-700 dark:text-neutral-500" data-hs-file-upload-file-icon></span>
					<div>
						<p class="text-sm font-medium text-gray-800 dark:text-white">
							<span class="truncate inline-block max-w-75 align-bottom" data-hs-file-upload-file-name></span>.<span data-hs-file-upload-file-ext></span>
						</p>
						<p class="text-xs text-gray-500 dark:text-neutral-500" data-hs-file-upload-file-size></p>
					</div>
				</div>
				<div class="inline-flex items-center gap-x-2">
					<button type="button" class="text-gray-500 hover:text-gray-800 dark:text-neutral-500 dark:hover:text-neutral-200" data-hs-file-upload-remove>
						<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
					</button>
				</div>
			</div>
			<div class="flex items-center gap-x-3 whitespace-nowrap">
				<div class="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" data-hs-file-upload-progress-bar>
					<div class="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition-all duration-500 hs-file-upload-complete:bg-green-600 dark:bg-blue-500" style="width: 0" data-hs-file-upload-progress-bar-pane></div>
				</div>
				<div class="w-10 text-end">
					<span class="text-sm text-gray-800 dark:text-white">
						<span data-hs-file-upload-progress-bar-value>0</span>%
					</span>
				</div>
			</div>
		</div>`;
          this.extensions = _.merge(
            {
              default: {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
                class: "size-5"
              },
              xls: {
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0243 1.43996H7.08805C6.82501 1.43996 6.57277 1.54445 6.38677 1.73043C6.20077 1.91642 6.09631 2.16868 6.09631 2.43171V6.64796L15.0243 11.856L19.4883 13.7398L23.9523 11.856V6.64796L15.0243 1.43996Z" fill="#21A366"></path><path d="M6.09631 6.64796H15.0243V11.856H6.09631V6.64796Z" fill="#107C41"></path><path d="M22.9605 1.43996H15.0243V6.64796H23.9523V2.43171C23.9523 2.16868 23.8478 1.91642 23.6618 1.73043C23.4758 1.54445 23.2235 1.43996 22.9605 1.43996Z" fill="#33C481"></path><path d="M15.0243 11.856H6.09631V21.2802C6.09631 21.5433 6.20077 21.7955 6.38677 21.9815C6.57277 22.1675 6.82501 22.272 7.08805 22.272H22.9606C23.2236 22.272 23.4759 22.1675 23.6618 21.9815C23.8478 21.7955 23.9523 21.5433 23.9523 21.2802V17.064L15.0243 11.856Z" fill="#185C37"></path><path d="M15.0243 11.856H23.9523V17.064H15.0243V11.856Z" fill="#107C41"></path><path opacity="0.1" d="M12.5446 5.15996H6.09631V19.296H12.5446C12.8073 19.2952 13.0591 19.1904 13.245 19.0046C13.4308 18.8188 13.5355 18.567 13.5363 18.3042V6.1517C13.5355 5.88892 13.4308 5.63712 13.245 5.4513C13.0591 5.26548 12.8073 5.16074 12.5446 5.15996Z" fill="black"></path><path opacity="0.2" d="M11.8006 5.90396H6.09631V20.04H11.8006C12.0633 20.0392 12.3151 19.9344 12.501 19.7486C12.6868 19.5628 12.7915 19.311 12.7923 19.0482V6.8957C12.7915 6.6329 12.6868 6.38114 12.501 6.19532C12.3151 6.0095 12.0633 5.90475 11.8006 5.90396Z" fill="black"></path><path opacity="0.2" d="M11.8006 5.90396H6.09631V18.552H11.8006C12.0633 18.5512 12.3151 18.4464 12.501 18.2606C12.6868 18.0748 12.7915 17.823 12.7923 17.5602V6.8957C12.7915 6.6329 12.6868 6.38114 12.501 6.19532C12.3151 6.0095 12.0633 5.90475 11.8006 5.90396Z" fill="black"></path><path opacity="0.2" d="M11.0566 5.90396H6.09631V18.552H11.0566C11.3193 18.5512 11.5711 18.4464 11.757 18.2606C11.9428 18.0748 12.0475 17.823 12.0483 17.5602V6.8957C12.0475 6.6329 11.9428 6.38114 11.757 6.19532C11.5711 6.0095 11.3193 5.90475 11.0566 5.90396Z" fill="black"></path><path d="M1.13604 5.90396H11.0566C11.3195 5.90396 11.5718 6.00842 11.7578 6.19442C11.9438 6.38042 12.0483 6.63266 12.0483 6.8957V16.8162C12.0483 17.0793 11.9438 17.3315 11.7578 17.5175C11.5718 17.7035 11.3195 17.808 11.0566 17.808H1.13604C0.873012 17.808 0.620754 17.7035 0.434765 17.5175C0.248775 17.3315 0.144287 17.0793 0.144287 16.8162V6.8957C0.144287 6.63266 0.248775 6.38042 0.434765 6.19442C0.620754 6.00842 0.873012 5.90396 1.13604 5.90396Z" fill="#107C41"></path><path d="M2.77283 15.576L5.18041 11.8455L2.9752 8.13596H4.74964L5.95343 10.5071C6.06401 10.7318 6.14015 10.8994 6.18185 11.01H6.19745C6.27683 10.8305 6.35987 10.6559 6.44669 10.4863L7.73309 8.13596H9.36167L7.09991 11.8247L9.41897 15.576H7.68545L6.29489 12.972C6.22943 12.861 6.17387 12.7445 6.12899 12.6238H6.10817C6.06761 12.7419 6.01367 12.855 5.94748 12.9608L4.51676 15.576H2.77283Z" fill="white"></path></svg>',
                class: "size-5"
              },
              doc: {
                icon: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.6141 1.91994H9.45071C9.09999 1.91994 8.76367 2.05926 8.51567 2.30725C8.26767 2.55523 8.12839 2.89158 8.12839 3.24228V8.86395L20.0324 12.3359L31.9364 8.86395V3.24228C31.9364 2.89158 31.797 2.55523 31.549 2.30725C31.3011 2.05926 30.9647 1.91994 30.6141 1.91994Z" fill="#41A5EE"></path><path d="M31.9364 8.86395H8.12839V15.8079L20.0324 19.2799L31.9364 15.8079V8.86395Z" fill="#2B7CD3"></path><path d="M31.9364 15.8079H8.12839V22.7519L20.0324 26.2239L31.9364 22.7519V15.8079Z" fill="#185ABD"></path><path d="M31.9364 22.752H8.12839V28.3736C8.12839 28.7244 8.26767 29.0607 8.51567 29.3087C8.76367 29.5567 9.09999 29.696 9.45071 29.696H30.6141C30.9647 29.696 31.3011 29.5567 31.549 29.3087C31.797 29.0607 31.9364 28.7244 31.9364 28.3736V22.752Z" fill="#103F91"></path><path opacity="0.1" d="M16.7261 6.87994H8.12839V25.7279H16.7261C17.0764 25.7269 17.4121 25.5872 17.6599 25.3395C17.9077 25.0917 18.0473 24.756 18.0484 24.4056V8.20226C18.0473 7.8519 17.9077 7.51616 17.6599 7.2684C17.4121 7.02064 17.0764 6.88099 16.7261 6.87994Z" class="fill-black dark:fill-neutral-200" fill="currentColor"></path><path opacity="0.2" d="M15.7341 7.87194H8.12839V26.7199H15.7341C16.0844 26.7189 16.4201 26.5792 16.6679 26.3315C16.9157 26.0837 17.0553 25.748 17.0564 25.3976V9.19426C17.0553 8.84386 16.9157 8.50818 16.6679 8.26042C16.4201 8.01266 16.0844 7.87299 15.7341 7.87194Z" class="fill-black dark:fill-neutral-200" fill="currentColor"></path><path opacity="0.2" d="M15.7341 7.87194H8.12839V24.7359H15.7341C16.0844 24.7349 16.4201 24.5952 16.6679 24.3475C16.9157 24.0997 17.0553 23.764 17.0564 23.4136V9.19426C17.0553 8.84386 16.9157 8.50818 16.6679 8.26042C16.4201 8.01266 16.0844 7.87299 15.7341 7.87194Z" class="fill-black dark:fill-neutral-200" fill="currentColor"></path><path opacity="0.2" d="M14.7421 7.87194H8.12839V24.7359H14.7421C15.0924 24.7349 15.4281 24.5952 15.6759 24.3475C15.9237 24.0997 16.0633 23.764 16.0644 23.4136V9.19426C16.0633 8.84386 15.9237 8.50818 15.6759 8.26042C15.4281 8.01266 15.0924 7.87299 14.7421 7.87194Z" class="fill-black dark:fill-neutral-200" fill="currentColor"></path><path d="M1.51472 7.87194H14.7421C15.0927 7.87194 15.4291 8.01122 15.6771 8.25922C15.925 8.50722 16.0644 8.84354 16.0644 9.19426V22.4216C16.0644 22.7723 15.925 23.1087 15.6771 23.3567C15.4291 23.6047 15.0927 23.7439 14.7421 23.7439H1.51472C1.16401 23.7439 0.827669 23.6047 0.579687 23.3567C0.3317 23.1087 0.192383 22.7723 0.192383 22.4216V9.19426C0.192383 8.84354 0.3317 8.50722 0.579687 8.25922C0.827669 8.01122 1.16401 7.87194 1.51472 7.87194Z" fill="#185ABD"></path><path d="M12.0468 20.7679H10.2612L8.17801 13.9231L5.99558 20.7679H4.20998L2.22598 10.8479H4.01158L5.40038 17.7919L7.48358 11.0463H8.97161L10.9556 17.7919L12.3444 10.8479H14.0308L12.0468 20.7679Z" fill="white"></path></svg>',
                class: "size-5"
              },
              zip: {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v18"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="20" r="2"/><path d="M10 7V6"/><path d="M10 12v-1"/><path d="M10 18v-2"/></svg>',
                class: "size-5"
              }
            },
            dataOptions.extensions
          );
          this.singleton = dataOptions.singleton;
          this.concatOptions = {
            clickable: this.el.querySelector(
              "[data-hs-file-upload-trigger]"
            ),
            previewsContainer: this.el.querySelector(
              "[data-hs-file-upload-previews]"
            ),
            addRemoveLinks: false,
            previewTemplate: this.previewTemplate,
            autoHideTrigger: false,
            ...dataOptions,
            ...options
          };
          this.onReloadButtonClickListener = [];
          this.onTempFileInputChangeListener = [];
          this.init();
        }
        tempFileInputChange(event, file) {
          const input = event.target;
          const newFile = input.files?.[0];
          if (newFile) {
            const dzNewFile = newFile;
            dzNewFile.status = Dropzone.ADDED;
            dzNewFile.accepted = true;
            dzNewFile.previewElement = file.previewElement;
            dzNewFile.previewTemplate = file.previewTemplate;
            dzNewFile.previewsContainer = file.previewsContainer;
            this.dropzone.removeFile(file);
            this.dropzone.addFile(dzNewFile);
          }
        }
        reloadButtonClick(evt, file) {
          evt.preventDefault();
          evt.stopPropagation();
          const tempFileInput = document.createElement("input");
          tempFileInput.type = "file";
          this.onTempFileInputChangeListener.push({
            el: tempFileInput,
            fn: (event) => this.tempFileInputChange(event, file)
          });
          tempFileInput.click();
          tempFileInput.addEventListener(
            "change",
            this.onTempFileInputChangeListener.find((el) => el.el === tempFileInput).fn
          );
        }
        init() {
          this.createCollection(window.$hsFileUploadCollection, this);
          this.initDropzone();
        }
        initDropzone() {
          const clear = this.el.querySelector(
            "[data-hs-file-upload-clear]"
          );
          const pseudoTriggers = Array.from(
            this.el.querySelectorAll("[data-hs-file-upload-pseudo-trigger]")
          );
          this.dropzone = new Dropzone(this.el, this.concatOptions);
          this.dropzone.on("addedfile", (file) => this.onAddFile(file));
          this.dropzone.on("removedfile", () => this.onRemoveFile());
          this.dropzone.on(
            "uploadprogress",
            (file, progress) => this.onUploadProgress(file, progress)
          );
          this.dropzone.on("complete", (file) => this.onComplete(file));
          if (clear)
            clear.onclick = () => {
              if (this.dropzone.files.length) this.dropzone.removeAllFiles(true);
            };
          if (pseudoTriggers.length)
            pseudoTriggers.forEach((el) => {
              el.onclick = () => {
                if (this.concatOptions?.clickable)
                  (this.concatOptions?.clickable).click();
              };
            });
        }
        // Public methods
        destroy() {
          this.onTempFileInputChangeListener.forEach((el) => {
            el.el.removeEventListener("change", el.fn);
          });
          this.onTempFileInputChangeListener = null;
          this.onReloadButtonClickListener.forEach((el) => {
            el.el.removeEventListener("click", el.fn);
          });
          this.onReloadButtonClickListener = null;
          this.dropzone.destroy();
          window.$hsFileUploadCollection = window.$hsFileUploadCollection.filter(
            ({ element }) => element.el !== this.el
          );
        }
        onAddFile(file) {
          const { previewElement } = file;
          const reloadButton = file.previewElement.querySelector(
            "[data-hs-file-upload-reload]"
          );
          if (!previewElement) return false;
          if (this.singleton && this.dropzone.files.length > 1)
            this.dropzone.removeFile(this.dropzone.files[0]);
          if (reloadButton) {
            this.onReloadButtonClickListener.push({
              el: reloadButton,
              fn: (evt) => this.reloadButtonClick(evt, file)
            });
            reloadButton.addEventListener(
              "click",
              this.onReloadButtonClickListener.find((el) => el.el === reloadButton).fn
            );
          }
          this.previewAccepted(file);
        }
        previewAccepted(file) {
          const { previewElement } = file;
          const fileInfo = this.splitFileName(file.name);
          const fileName = previewElement.querySelector(
            "[data-hs-file-upload-file-name]"
          );
          const fileExt = previewElement.querySelector(
            "[data-hs-file-upload-file-ext]"
          );
          const fileSize = previewElement.querySelector(
            "[data-hs-file-upload-file-size]"
          );
          const fileIcon = previewElement.querySelector(
            "[data-hs-file-upload-file-icon]"
          );
          const trigger = this.el.querySelector(
            "[data-hs-file-upload-trigger]"
          );
          const preview = previewElement.querySelector(
            "[data-dz-thumbnail]"
          );
          const remove = previewElement.querySelector(
            "[data-hs-file-upload-remove]"
          );
          if (fileName) fileName.textContent = fileInfo.name;
          if (fileExt) fileExt.textContent = fileInfo.extension;
          if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
          if (preview) {
            if (file.type.includes("image/")) preview.classList.remove("hidden");
            else this.setIcon(fileInfo.extension, fileIcon);
          }
          if (this.dropzone.files.length > 0 && this.concatOptions.autoHideTrigger)
            trigger.style.display = "none";
          if (remove) remove.onclick = () => this.dropzone.removeFile(file);
        }
        onRemoveFile() {
          const trigger = this.el.querySelector(
            "[data-hs-file-upload-trigger]"
          );
          if (this.dropzone.files.length === 0 && this.concatOptions.autoHideTrigger)
            trigger.style.display = "";
        }
        onUploadProgress(file, progress) {
          const { previewElement } = file;
          if (!previewElement) return false;
          const progressBar = previewElement.querySelector(
            "[data-hs-file-upload-progress-bar]"
          );
          const progressBarPane = previewElement.querySelector(
            "[data-hs-file-upload-progress-bar-pane]"
          );
          const progressBarValue = previewElement.querySelector(
            "[data-hs-file-upload-progress-bar-value]"
          );
          const currentProgress = Math.floor(progress);
          if (progressBar)
            progressBar.setAttribute("aria-valuenow", `${currentProgress}`);
          if (progressBarPane) progressBarPane.style.width = `${currentProgress}%`;
          if (progressBarValue) progressBarValue.innerText = `${currentProgress}`;
        }
        onComplete(file) {
          const { previewElement } = file;
          if (!previewElement) return false;
          previewElement.classList.add("complete");
        }
        setIcon(ext, file) {
          const icon = this.createIcon(ext);
          file.append(icon);
        }
        createIcon(ext) {
          const icon = this.extensions[ext]?.icon ? htmlToElement(this.extensions[ext].icon) : htmlToElement(this.extensions.default.icon);
          classToClassList(
            this.extensions[ext]?.class ? this.extensions[ext].class : this.extensions.default.class,
            icon
          );
          return icon;
        }
        formatFileSize(size2) {
          if (size2 < 1024) {
            return size2.toFixed(2) + " B";
          } else if (size2 < 1024 * 1024) {
            return (size2 / 1024).toFixed(2) + " KB";
          } else if (size2 < 1024 * 1024 * 1024) {
            return (size2 / (1024 * 1024)).toFixed(2) + " MB";
          } else if (size2 < 1024 * 1024 * 1024 * 1024) {
            return (size2 / (1024 * 1024 * 1024)).toFixed(2) + " GB";
          } else {
            return (size2 / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB";
          }
        }
        splitFileName(file) {
          let dotIndex = file.lastIndexOf(".");
          if (dotIndex == -1) return { name: file, extension: "" };
          return {
            name: file.substring(0, dotIndex),
            extension: file.substring(dotIndex + 1)
          };
        }
        // Static methods
        static getInstance(target, isInstance) {
          const elInCollection = window.$hsFileUploadCollection.find(
            (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
          );
          return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
        }
        static autoInit() {
          if (!window.$hsFileUploadCollection) window.$hsFileUploadCollection = [];
          if (window.$hsFileUploadCollection)
            window.$hsFileUploadCollection = window.$hsFileUploadCollection.filter(
              ({ element }) => document.contains(element.el)
            );
          document.querySelectorAll("[data-hs-file-upload]:not(.--prevent-on-load-init)").forEach((el) => {
            if (!window.$hsFileUploadCollection.find(
              (elC) => elC?.element?.el === el
            ))
              new _HSFileUpload(el);
          });
        }
      };
      window.addEventListener("load", () => {
        if (document.querySelectorAll(
          "[data-hs-file-upload]:not(.--prevent-on-load-init)"
        ).length) {
          if (typeof _ === "undefined")
            console.error(
              "HSFileUpload: Lodash is not available, please add it to the page."
            );
          if (typeof Dropzone === "undefined")
            console.error(
              "HSFileUpload: Dropzone is not available, please add it to the page."
            );
        }
        if (typeof _ !== "undefined" && typeof Dropzone !== "undefined") {
          HSFileUpload.autoInit();
        }
      });
      if (typeof window !== "undefined") {
        window.HSFileUpload = HSFileUpload;
      }
      file_upload_default = HSFileUpload;
    }
  });

  // node_modules/preline/src/plugins/range-slider/index.ts
  var range_slider_exports = {};
  __export(range_slider_exports, {
    default: () => range_slider_default
  });
  var HSRangeSlider, range_slider_default;
  var init_range_slider = __esm({
    "node_modules/preline/src/plugins/range-slider/index.ts"() {
      init_base_plugin();
      HSRangeSlider = class _HSRangeSlider extends HSBasePlugin {
        concatOptions;
        wrapper;
        currentValue;
        format;
        icons;
        constructor(el, options, events) {
          super(el, options, events);
          const data = el.getAttribute("data-hs-range-slider");
          const dataOptions = data ? JSON.parse(data) : {};
          this.concatOptions = {
            ...dataOptions,
            ...options,
            cssClasses: {
              ...noUiSlider.cssClasses,
              ...this.processClasses(dataOptions.cssClasses)
            }
          };
          this.wrapper = this.concatOptions.wrapper || el.closest(".hs-range-slider-wrapper") || null;
          this.currentValue = this.concatOptions.currentValue ? Array.from(this.concatOptions.currentValue) : Array.from(
            this.wrapper?.querySelectorAll(".hs-range-slider-current-value") || []
          );
          this.icons = this.concatOptions.icons || {};
          this.init();
        }
        get formattedValue() {
          const values = this.el.noUiSlider.get();
          if (Array.isArray(values) && this.format) {
            const updateValues = [];
            values.forEach((val) => {
              updateValues.push(this.format.to(val));
            });
            return updateValues;
          } else if (this.format) {
            return this.format.to(values);
          } else {
            return values;
          }
        }
        processClasses(cl) {
          const mergedClasses = {};
          Object.keys(cl).forEach((key) => {
            if (key) mergedClasses[key] = `${noUiSlider.cssClasses[key]} ${cl[key]}`;
          });
          return mergedClasses;
        }
        init() {
          this.createCollection(window.$hsRangeSliderCollection, this);
          if (typeof this.concatOptions?.formatter === "object" ? this.concatOptions?.formatter?.type === "thousandsSeparatorAndDecimalPoints" : this.concatOptions?.formatter === "thousandsSeparatorAndDecimalPoints") {
            this.thousandsSeparatorAndDecimalPointsFormatter();
          } else if (typeof this.concatOptions?.formatter === "object" ? this.concatOptions?.formatter?.type === "integer" : this.concatOptions?.formatter === "integer") {
            this.integerFormatter();
          } else if (typeof this.concatOptions?.formatter === "object" && (this.concatOptions?.formatter?.prefix || this.concatOptions?.formatter?.postfix)) {
            this.prefixOrPostfixFormatter();
          }
          noUiSlider.create(this.el, this.concatOptions);
          if (this.currentValue && this.currentValue.length > 0) {
            this.el.noUiSlider.on(
              "update",
              (values) => {
                this.updateCurrentValue(values);
              }
            );
          }
          if (this.concatOptions.disabled) this.setDisabled();
          if (this.icons.handle) this.buildHandleIcon();
        }
        formatValue(val) {
          let result = "";
          if (typeof this.concatOptions?.formatter === "object") {
            if (this.concatOptions?.formatter?.prefix) {
              result += this.concatOptions?.formatter?.prefix;
            }
            result += val;
            if (this.concatOptions?.formatter?.postfix) {
              result += this.concatOptions?.formatter?.postfix;
            }
          } else result += val;
          return result;
        }
        integerFormatter() {
          this.format = {
            to: (val) => this.formatValue(Math.round(val)),
            from: (val) => Math.round(+val)
          };
          if (this.concatOptions?.tooltips) this.concatOptions.tooltips = this.format;
        }
        prefixOrPostfixFormatter() {
          this.format = {
            to: (val) => this.formatValue(val),
            from: (val) => +val
          };
          if (this.concatOptions?.tooltips) this.concatOptions.tooltips = this.format;
        }
        thousandsSeparatorAndDecimalPointsFormatter() {
          this.format = {
            to: (val) => this.formatValue(
              new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(val)
            ),
            from: (val) => parseFloat(val.replace(/,/g, ""))
          };
          if (this.concatOptions?.tooltips) this.concatOptions.tooltips = this.format;
        }
        setDisabled() {
          this.el.setAttribute("disabled", "disabled");
          this.el.classList.add("disabled");
        }
        buildHandleIcon() {
          if (!this.icons.handle) return false;
          const handle = this.el.querySelector(".noUi-handle");
          if (!handle) return false;
          handle.innerHTML = this.icons.handle;
        }
        updateCurrentValue(values) {
          if (!this.currentValue || this.currentValue.length === 0) return;
          values.forEach((value, index) => {
            const element = this.currentValue?.[index];
            if (!element) return;
            const formattedValue = this.format ? this.format.to(value).toString() : value.toString();
            if (element instanceof HTMLInputElement) {
              element.value = formattedValue;
            } else {
              element.textContent = formattedValue;
            }
          });
        }
        // Public methods
        destroy() {
          this.el.noUiSlider.destroy();
          this.format = null;
          window.$hsRangeSliderCollection = window.$hsRangeSliderCollection.filter(
            ({ element }) => element.el !== this.el
          );
        }
        // Static methods
        static getInstance(target, isInstance = false) {
          const elInCollection = window.$hsRangeSliderCollection.find(
            (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
          );
          return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
        }
        static autoInit() {
          if (!window.$hsRangeSliderCollection) window.$hsRangeSliderCollection = [];
          if (window.$hsRangeSliderCollection) {
            window.$hsRangeSliderCollection = window.$hsRangeSliderCollection.filter(
              ({ element }) => document.contains(element.el)
            );
          }
          document.querySelectorAll("[data-hs-range-slider]:not(.--prevent-on-load-init)").forEach((el) => {
            if (!window.$hsRangeSliderCollection.find(
              (elC) => elC?.element?.el === el
            )) {
              new _HSRangeSlider(el);
            }
          });
        }
      };
      window.addEventListener("load", () => {
        HSRangeSlider.autoInit();
      });
      if (typeof window !== "undefined") {
        window.HSRangeSlider = HSRangeSlider;
      }
      range_slider_default = HSRangeSlider;
    }
  });

  // node_modules/vanilla-calendar-pro/index.mjs
  function getOffset(e2) {
    if (!e2 || !e2.getBoundingClientRect) return { top: 0, bottom: 0, left: 0, right: 0 };
    const t = e2.getBoundingClientRect(), n = document.documentElement;
    return { bottom: t.bottom, right: t.right, top: t.top + window.scrollY - n.clientTop, left: t.left + window.scrollX - n.clientLeft };
  }
  function getViewportDimensions() {
    return { vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0), vh: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) };
  }
  function getWindowScrollPosition() {
    return { left: window.scrollX || document.documentElement.scrollLeft || 0, top: window.scrollY || document.documentElement.scrollTop || 0 };
  }
  function calculateAvailableSpace(e2) {
    const { top: t, left: n } = getWindowScrollPosition(), { top: a, left: l } = getOffset(e2), { vh: o, vw: s } = getViewportDimensions(), i = a - t, r = l - n;
    return { top: i, bottom: o - (i + e2.clientHeight), left: r, right: s - (r + e2.clientWidth) };
  }
  function getAvailablePosition(e2, t, n = 5) {
    const a = { top: true, bottom: true, left: true, right: true }, l = [];
    if (!t || !e2) return { canShow: a, parentPositions: l };
    const { bottom: o, top: s } = calculateAvailableSpace(e2), { top: i, left: r } = getOffset(e2), { height: c, width: d } = t.getBoundingClientRect(), { vh: u, vw: m } = getViewportDimensions(), h = m / 2, p = u / 2;
    return [{ condition: i < p, position: "top" }, { condition: i > p, position: "bottom" }, { condition: r < h, position: "left" }, { condition: r > h, position: "right" }].forEach((({ condition: e3, position: t2 }) => {
      e3 && l.push(t2);
    })), Object.assign(a, { top: c <= s - n, bottom: c <= o - n, left: d <= r, right: d <= m - r }), { canShow: a, parentPositions: l };
  }
  function findBestPickerPosition(e2, t) {
    const n = "left";
    if (!t || !e2) return n;
    const { canShow: a, parentPositions: l } = getAvailablePosition(e2, t), o = a.left && a.right;
    return (o && a.bottom ? "center" : o && a.top ? ["top", "center"] : Array.isArray(l) ? ["bottom" === l[0] ? "top" : "bottom", ...l.slice(1)] : l) || n;
  }
  var __defProp2, __defProps, __getOwnPropDescs, __getOwnPropSymbols, __hasOwnProp2, __propIsEnum, __defNormalProp, __spreadValues, __spreadProps, __publicField, errorMessages, setContext, destroy, hide2, handleDay, createDatePopup, getDate, getDateString, parseDates, updateAttribute, setDateModifier, getLocaleString, getWeekNumber, addWeekNumberForDate, setDaysAsDisabled, createDate, createDatesFromCurrentMonth, createDatesFromNextMonth, createDatesFromPrevMonth, createWeekNumbers, createDates, layoutDefault, layoutMonths, layoutMultiple, layoutYears, ArrowNext, ArrowPrev, ControlTime, DateRangeTooltip, Dates, Month, Months, Week, WeekNumbers, Year, Years, components, getComponent, parseLayout, parseMultipleLayout, createLayouts, setVisibilityArrows, handleDefaultType, handleYearType, visibilityArrows, visibilityHandler, visibilityTitle, setYearModifier, getColumnID, createMonthEl, createMonths, TimeInput, TimeRange, handleActions, transformTime24, handleClickKeepingTime, transformTime12, updateInputAndRange, updateKeepingTime$1, handleInput$1, updateInputAndTime, updateKeepingTime, handleRange, handleMouseOver, handleMouseOut, handleTime, createTime, createWeek, createYearEl, createYears, trackChangesHTMLElement, haveListener, setTheme, trackChangesThemeInSystemSettings, detectTheme, handleTheme, capitalizeFirstLetter, getLocaleWeekday, getLocaleMonth, getLocale, create, handleArrowKeys, handleMonth, handleClickArrow, canToggleSelection, handleSelectDate, createDateRangeTooltip, state, addHoverEffect, removeHoverEffect, handleHoverDatesEvent, handleHoverSelectedDatesRangeEvent, optimizedHoverHandler, optimizedHandleHoverDatesEvent, optimizedHandleHoverSelectedDatesRangeEvent, handleCancelSelectionDates, handleMouseLeave, updateDisabledDates, handleSelectDateRange, updateDateModifier, handleClickDate, typeClick, getValue, handleMultipleYearSelection, handleMultipleMonthSelection, handleItemClick, handleClickType, handleClickMonthOrYear, handleClickWeekNumber, handleClickWeekDay, handleClick, initMonthsCount, getLocalDate, resolveDate, initRange, initSelectedDates, displayClosestValidDate, setInitialContext, initSelectedMonthYear, initTime, initAllVariables, reset, createToInput, handleInput, init, update, replaceProperties, set, setPosition, show, labels, styles, OptionsCalendar, _Calendar, Calendar;
  var init_vanilla_calendar_pro = __esm({
    "node_modules/vanilla-calendar-pro/index.mjs"() {
      __defProp2 = Object.defineProperty;
      __defProps = Object.defineProperties;
      __getOwnPropDescs = Object.getOwnPropertyDescriptors;
      __getOwnPropSymbols = Object.getOwnPropertySymbols;
      __hasOwnProp2 = Object.prototype.hasOwnProperty;
      __propIsEnum = Object.prototype.propertyIsEnumerable;
      __defNormalProp = (e2, t, n) => t in e2 ? __defProp2(e2, t, { enumerable: true, configurable: true, writable: true, value: n }) : e2[t] = n;
      __spreadValues = (e2, t) => {
        for (var n in t || (t = {})) __hasOwnProp2.call(t, n) && __defNormalProp(e2, n, t[n]);
        if (__getOwnPropSymbols) for (var n of __getOwnPropSymbols(t)) __propIsEnum.call(t, n) && __defNormalProp(e2, n, t[n]);
        return e2;
      };
      __spreadProps = (e2, t) => __defProps(e2, __getOwnPropDescs(t));
      __publicField = (e2, t, n) => (__defNormalProp(e2, "symbol" != typeof t ? t + "" : t, n), n);
      errorMessages = { notFoundSelector: (e2) => `${e2} is not found, check the first argument passed to new Calendar.`, notInit: 'The calendar has not been initialized, please initialize it using the "init()" method first.', notLocale: "You specified an incorrect language label or did not specify the required number of values \u200B\u200Bfor \xABlocale.weekdays\xBB or \xABlocale.months\xBB.", incorrectTime: "The value of the time property can be: false, 12 or 24.", incorrectMonthsCount: "For the \xABmultiple\xBB calendar type, the \xABdisplayMonthsCount\xBB parameter can have a value from 2 to 12, and for all others it cannot be greater than 1." };
      setContext = (e2, t, n) => {
        e2.context[t] = n;
      };
      destroy = (e2) => {
        var t, n, a, l, o;
        if (!e2.context.isInit) throw new Error(errorMessages.notInit);
        e2.inputMode ? (null == (t = e2.context.mainElement.parentElement) || t.removeChild(e2.context.mainElement), null == (a = null == (n = e2.context.inputElement) ? void 0 : n.replaceWith) || a.call(n, e2.context.originalElement), setContext(e2, "inputElement", void 0)) : null == (o = (l = e2.context.mainElement).replaceWith) || o.call(l, e2.context.originalElement), setContext(e2, "mainElement", e2.context.originalElement), e2.onDestroy && e2.onDestroy(e2);
      };
      hide2 = (e2) => {
        e2.context.isShowInInputMode && e2.context.currentType && (e2.context.mainElement.dataset.vcCalendarHidden = "", setContext(e2, "isShowInInputMode", false), e2.context.cleanupHandlers[0] && (e2.context.cleanupHandlers.forEach(((e3) => e3())), setContext(e2, "cleanupHandlers", [])), e2.onHide && e2.onHide(e2));
      };
      handleDay = (e2, t, n, a) => {
        var l;
        const o = a.querySelector(`[data-vc-date="${t}"]`), s = null == o ? void 0 : o.querySelector("[data-vc-date-btn]");
        if (!o || !s) return;
        if ((null == n ? void 0 : n.modifier) && s.classList.add(...n.modifier.trim().split(" ")), !(null == n ? void 0 : n.html)) return;
        const i = document.createElement("div");
        i.className = e2.styles.datePopup, i.dataset.vcDatePopup = "", i.innerHTML = e2.sanitizerHTML(n.html), s.ariaExpanded = "true", s.ariaLabel = `${s.ariaLabel}, ${null == (l = null == i ? void 0 : i.textContent) ? void 0 : l.replace(/^\s+|\s+(?=\s)|\s+$/g, "").replace(/&nbsp;/g, " ")}`, o.appendChild(i), requestAnimationFrame((() => {
          if (!i) return;
          const { canShow: e3 } = getAvailablePosition(o, i), t2 = e3.bottom ? o.offsetHeight : -i.offsetHeight, n2 = e3.left && !e3.right ? o.offsetWidth - i.offsetWidth / 2 : !e3.left && e3.right ? i.offsetWidth / 2 : 0;
          Object.assign(i.style, { left: `${n2}px`, top: `${t2}px` });
        }));
      };
      createDatePopup = (e2, t) => {
        var n;
        e2.popups && (null == (n = Object.entries(e2.popups)) || n.forEach((([n2, a]) => handleDay(e2, n2, a, t))));
      };
      getDate = (e2) => /* @__PURE__ */ new Date(`${e2}T00:00:00`);
      getDateString = (e2) => `${e2.getFullYear()}-${String(e2.getMonth() + 1).padStart(2, "0")}-${String(e2.getDate()).padStart(2, "0")}`;
      parseDates = (e2) => e2.reduce(((e3, t) => {
        if (t instanceof Date || "number" == typeof t) {
          const n = t instanceof Date ? t : new Date(t);
          e3.push(n.toISOString().substring(0, 10));
        } else t.match(/^(\d{4}-\d{2}-\d{2})$/g) ? e3.push(t) : t.replace(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/g, ((t2, n, a) => {
          const l = getDate(n), o = getDate(a), s = new Date(l.getTime());
          for (; s <= o; s.setDate(s.getDate() + 1)) e3.push(getDateString(s));
          return t2;
        }));
        return e3;
      }), []);
      updateAttribute = (e2, t, n, a = "") => {
        t ? e2.setAttribute(n, a) : e2.getAttribute(n) === a && e2.removeAttribute(n);
      };
      setDateModifier = (e2, t, n, a, l, o, s) => {
        var i, r, c, d;
        const u = getDate(e2.context.displayDateMin) > getDate(o) || getDate(e2.context.displayDateMax) < getDate(o) || (null == (i = e2.context.disableDates) ? void 0 : i.includes(o)) || !e2.selectionMonthsMode && "current" !== s || !e2.selectionYearsMode && getDate(o).getFullYear() !== t;
        updateAttribute(n, u, "data-vc-date-disabled"), a && updateAttribute(a, u, "aria-disabled", "true"), a && updateAttribute(a, u, "tabindex", "-1"), updateAttribute(n, !e2.disableToday && e2.context.dateToday === o, "data-vc-date-today"), updateAttribute(n, !e2.disableToday && e2.context.dateToday === o, "aria-current", "date"), updateAttribute(n, null == (r = e2.selectedWeekends) ? void 0 : r.includes(l), "data-vc-date-weekend");
        const m = (null == (c = e2.selectedHolidays) ? void 0 : c[0]) ? parseDates(e2.selectedHolidays) : [];
        if (updateAttribute(n, m.includes(o), "data-vc-date-holiday"), (null == (d = e2.context.selectedDates) ? void 0 : d.includes(o)) ? (n.setAttribute("data-vc-date-selected", ""), a && a.setAttribute("aria-selected", "true"), e2.context.selectedDates.length > 1 && "multiple-ranged" === e2.selectionDatesMode && (e2.context.selectedDates[0] === o && e2.context.selectedDates[e2.context.selectedDates.length - 1] === o ? n.setAttribute("data-vc-date-selected", "first-and-last") : e2.context.selectedDates[0] === o ? n.setAttribute("data-vc-date-selected", "first") : e2.context.selectedDates[e2.context.selectedDates.length - 1] === o && n.setAttribute("data-vc-date-selected", "last"), e2.context.selectedDates[0] !== o && e2.context.selectedDates[e2.context.selectedDates.length - 1] !== o && n.setAttribute("data-vc-date-selected", "middle"))) : n.hasAttribute("data-vc-date-selected") && (n.removeAttribute("data-vc-date-selected"), a && a.removeAttribute("aria-selected")), !e2.context.disableDates.includes(o) && e2.enableEdgeDatesOnly && e2.context.selectedDates.length > 1 && "multiple-ranged" === e2.selectionDatesMode) {
          const t2 = getDate(e2.context.selectedDates[0]), a2 = getDate(e2.context.selectedDates[e2.context.selectedDates.length - 1]), l2 = getDate(o);
          updateAttribute(n, l2 > t2 && l2 < a2, "data-vc-date-selected", "middle");
        }
      };
      getLocaleString = (e2, t, n) => (/* @__PURE__ */ new Date(`${e2}T00:00:00.000Z`)).toLocaleString(t, n);
      getWeekNumber = (e2, t) => {
        const n = getDate(e2), a = (n.getDay() - t + 7) % 7;
        n.setDate(n.getDate() + 4 - a);
        const l = new Date(n.getFullYear(), 0, 1), o = Math.ceil(((+n - +l) / 864e5 + 1) / 7);
        return { year: n.getFullYear(), week: o };
      };
      addWeekNumberForDate = (e2, t, n) => {
        const a = getWeekNumber(n, e2.firstWeekday);
        a && (t.dataset.vcDateWeekNumber = String(a.week));
      };
      setDaysAsDisabled = (e2, t, n) => {
        var a, l, o, s, i;
        const r = null == (a = e2.disableWeekdays) ? void 0 : a.includes(n), c = e2.disableAllDates && !!(null == (l = e2.context.enableDates) ? void 0 : l[0]);
        !r && !c || (null == (o = e2.context.enableDates) ? void 0 : o.includes(t)) || (null == (s = e2.context.disableDates) ? void 0 : s.includes(t)) || (e2.context.disableDates.push(t), null == (i = e2.context.disableDates) || i.sort(((e3, t2) => +new Date(e3) - +new Date(t2))));
      };
      createDate = (e2, t, n, a, l, o) => {
        const s = getDate(l).getDay(), i = "string" == typeof e2.locale && e2.locale.length ? e2.locale : "en", r = document.createElement("div");
        let c;
        r.className = e2.styles.date, r.dataset.vcDate = l, r.dataset.vcDateMonth = o, r.dataset.vcDateWeekDay = String(s), ("current" === o || e2.displayDatesOutside) && (c = document.createElement("button"), c.className = e2.styles.dateBtn, c.type = "button", c.role = "gridcell", c.ariaLabel = getLocaleString(l, i, { dateStyle: "long", timeZone: "UTC" }), c.dataset.vcDateBtn = "", c.innerText = String(a), r.appendChild(c)), e2.enableWeekNumbers && addWeekNumberForDate(e2, r, l), setDaysAsDisabled(e2, l, s), setDateModifier(e2, t, r, c, s, l, o), n.appendChild(r), e2.onCreateDateEls && e2.onCreateDateEls(e2, r);
      };
      createDatesFromCurrentMonth = (e2, t, n, a, l) => {
        for (let o = 1; o <= n; o++) {
          const n2 = new Date(a, l, o);
          createDate(e2, a, t, o, getDateString(n2), "current");
        }
      };
      createDatesFromNextMonth = (e2, t, n, a, l, o) => {
        const s = o + n, i = 7 * Math.ceil(s / 7) - s, r = l + 1 === 12 ? a + 1 : a, c = l + 1 === 12 ? "01" : l + 2 < 10 ? `0${l + 2}` : l + 2;
        for (let n2 = 1; n2 <= i; n2++) {
          const l2 = n2 < 10 ? `0${n2}` : String(n2);
          createDate(e2, a, t, n2, `${r}-${c}-${l2}`, "next");
        }
      };
      createDatesFromPrevMonth = (e2, t, n, a, l) => {
        let o = new Date(n, a, 0).getDate() - (l - 1);
        const s = 0 === a ? n - 1 : n, i = 0 === a ? 12 : a < 10 ? `0${a}` : a;
        for (let a2 = l; a2 > 0; a2--, o++) {
          createDate(e2, n, t, o, `${s}-${i}-${o}`, "prev");
        }
      };
      createWeekNumbers = (e2, t, n, a, l) => {
        if (!e2.enableWeekNumbers) return;
        a.textContent = "";
        const o = document.createElement("b");
        o.className = e2.styles.weekNumbersTitle, o.innerText = "#", o.dataset.vcWeekNumbers = "title", a.appendChild(o);
        const s = document.createElement("div");
        s.className = e2.styles.weekNumbersContent, s.dataset.vcWeekNumbers = "content", a.appendChild(s);
        const i = document.createElement("button");
        i.type = "button", i.className = e2.styles.weekNumber;
        const r = l.querySelectorAll("[data-vc-date]"), c = Math.ceil((t + n) / 7);
        for (let t2 = 0; t2 < c; t2++) {
          const n2 = r[0 === t2 ? 6 : 7 * t2].dataset.vcDate, a2 = getWeekNumber(n2, e2.firstWeekday);
          if (!a2) return;
          const l2 = i.cloneNode(true);
          l2.innerText = String(a2.week), l2.dataset.vcWeekNumber = String(a2.week), l2.dataset.vcWeekYear = String(a2.year), l2.role = "rowheader", l2.ariaLabel = `${a2.week}`, s.appendChild(l2);
        }
      };
      createDates = (e2) => {
        const t = new Date(e2.context.selectedYear, e2.context.selectedMonth, 1), n = e2.context.mainElement.querySelectorAll('[data-vc="dates"]'), a = e2.context.mainElement.querySelectorAll('[data-vc-week="numbers"]');
        n.forEach(((n2, l) => {
          e2.selectionDatesMode || (n2.dataset.vcDatesDisabled = ""), n2.textContent = "";
          const o = new Date(t);
          o.setMonth(o.getMonth() + l);
          const s = o.getMonth(), i = o.getFullYear(), r = (new Date(i, s, 1).getDay() - e2.firstWeekday + 7) % 7, c = new Date(i, s + 1, 0).getDate();
          createDatesFromPrevMonth(e2, n2, i, s, r), createDatesFromCurrentMonth(e2, n2, c, i, s), createDatesFromNextMonth(e2, n2, c, i, s, r), createDatePopup(e2, n2), createWeekNumbers(e2, r, c, a[l], n2);
        }));
      };
      layoutDefault = (e2) => `
  <div class="${e2.styles.header}" data-vc="header" role="toolbar" aria-label="${e2.labels.navigation}">
    <#ArrowPrev [month] />
    <div class="${e2.styles.headerContent}" data-vc-header="content">
      <#Month />
      <#Year />
    </div>
    <#ArrowNext [month] />
  </div>
  <div class="${e2.styles.wrapper}" data-vc="wrapper">
    <#WeekNumbers />
    <div class="${e2.styles.content}" data-vc="content">
      <#Week />
      <#Dates />
      <#DateRangeTooltip />
    </div>
  </div>
  <#ControlTime />
`;
      layoutMonths = (e2) => `
  <div class="${e2.styles.header}" data-vc="header" role="toolbar" aria-label="${e2.labels.navigation}">
    <div class="${e2.styles.headerContent}" data-vc-header="content">
      <#Month />
      <#Year />
    </div>
  </div>
  <div class="${e2.styles.wrapper}" data-vc="wrapper">
    <div class="${e2.styles.content}" data-vc="content">
      <#Months />
    </div>
  </div>
`;
      layoutMultiple = (e2) => `
  <div class="${e2.styles.controls}" data-vc="controls" role="toolbar" aria-label="${e2.labels.navigation}">
    <#ArrowPrev [month] />
    <#ArrowNext [month] />
  </div>
  <div class="${e2.styles.grid}" data-vc="grid">
    <#Multiple>
      <div class="${e2.styles.column}" data-vc="column" role="region">
        <div class="${e2.styles.header}" data-vc="header">
          <div class="${e2.styles.headerContent}" data-vc-header="content">
            <#Month />
            <#Year />
          </div>
        </div>
        <div class="${e2.styles.wrapper}" data-vc="wrapper">
          <#WeekNumbers />
          <div class="${e2.styles.content}" data-vc="content">
            <#Week />
            <#Dates />
          </div>
        </div>
      </div>
    <#/Multiple>
    <#DateRangeTooltip />
  </div>
  <#ControlTime />
`;
      layoutYears = (e2) => `
  <div class="${e2.styles.header}" data-vc="header" role="toolbar" aria-label="${e2.labels.navigation}">
    <#ArrowPrev [year] />
    <div class="${e2.styles.headerContent}" data-vc-header="content">
      <#Month />
      <#Year />
    </div>
    <#ArrowNext [year] />
  </div>
  <div class="${e2.styles.wrapper}" data-vc="wrapper">
    <div class="${e2.styles.content}" data-vc="content">
      <#Years />
    </div>
  </div>
`;
      ArrowNext = (e2, t) => `<button type="button" class="${e2.styles.arrowNext}" data-vc-arrow="next" aria-label="${e2.labels.arrowNext[t]}"></button>`;
      ArrowPrev = (e2, t) => `<button type="button" class="${e2.styles.arrowPrev}" data-vc-arrow="prev" aria-label="${e2.labels.arrowPrev[t]}"></button>`;
      ControlTime = (e2) => e2.selectionTimeMode ? `<div class="${e2.styles.time}" data-vc="time" role="group" aria-label="${e2.labels.selectingTime}"></div>` : "";
      DateRangeTooltip = (e2) => e2.onCreateDateRangeTooltip ? `<div class="${e2.styles.dateRangeTooltip}" data-vc-date-range-tooltip="hidden"></div>` : "";
      Dates = (e2) => `<div class="${e2.styles.dates}" data-vc="dates" role="grid" aria-live="assertive" aria-label="${e2.labels.dates}" ${"multiple" === e2.type ? "aria-multiselectable" : ""}></div>`;
      Month = (e2) => `<button type="button" class="${e2.styles.month}" data-vc="month"></button>`;
      Months = (e2) => `<div class="${e2.styles.months}" data-vc="months" role="grid" aria-live="assertive" aria-label="${e2.labels.months}"></div>`;
      Week = (e2) => `<div class="${e2.styles.week}" data-vc="week" role="row" aria-label="${e2.labels.week}"></div>`;
      WeekNumbers = (e2) => e2.enableWeekNumbers ? `<div class="${e2.styles.weekNumbers}" data-vc-week="numbers" role="row" aria-label="${e2.labels.weekNumber}"></div>` : "";
      Year = (e2) => `<button type="button" class="${e2.styles.year}" data-vc="year"></button>`;
      Years = (e2) => `<div class="${e2.styles.years}" data-vc="years" role="grid" aria-live="assertive" aria-label="${e2.labels.years}"></div>`;
      components = { ArrowNext, ArrowPrev, ControlTime, Dates, DateRangeTooltip, Month, Months, Week, WeekNumbers, Year, Years };
      getComponent = (e2) => components[e2];
      parseLayout = (e2, t) => t.replace(/[\n\t]/g, "").replace(/<#(?!\/?Multiple)(.*?)>/g, ((t2, n) => {
        const a = (n.match(/\[(.*?)\]/) || [])[1], l = n.replace(/[/\s\n\t]|\[(.*?)\]/g, ""), o = getComponent(l), s = o ? o(e2, null != a ? a : null) : "";
        return e2.sanitizerHTML(s);
      })).replace(/[\n\t]/g, "");
      parseMultipleLayout = (e2, t) => t.replace(new RegExp("<#Multiple>(.*?)<#\\/Multiple>", "gs"), ((t2, n) => {
        const a = Array(e2.context.displayMonthsCount).fill(n).join("");
        return e2.sanitizerHTML(a);
      })).replace(/[\n\t]/g, "");
      createLayouts = (e2, t) => {
        const n = { default: layoutDefault, month: layoutMonths, year: layoutYears, multiple: layoutMultiple };
        if (Object.keys(n).forEach(((t2) => {
          const a = t2;
          e2.layouts[a].length || (e2.layouts[a] = n[a](e2));
        })), e2.context.mainElement.className = e2.styles.calendar, e2.context.mainElement.dataset.vc = "calendar", e2.context.mainElement.dataset.vcType = e2.context.currentType, e2.context.mainElement.role = "application", e2.context.mainElement.tabIndex = 0, e2.context.mainElement.ariaLabel = e2.labels.application, "multiple" !== e2.context.currentType) {
          if ("multiple" === e2.type && t) {
            const n2 = e2.context.mainElement.querySelector('[data-vc="controls"]'), a = e2.context.mainElement.querySelector('[data-vc="grid"]'), l = t.closest('[data-vc="column"]');
            return n2 && e2.context.mainElement.removeChild(n2), a && (a.dataset.vcGrid = "hidden"), l && (l.dataset.vcColumn = e2.context.currentType), void (l && (l.innerHTML = e2.sanitizerHTML(parseLayout(e2, e2.layouts[e2.context.currentType]))));
          }
          e2.context.mainElement.innerHTML = e2.sanitizerHTML(parseLayout(e2, e2.layouts[e2.context.currentType]));
        } else e2.context.mainElement.innerHTML = e2.sanitizerHTML(parseMultipleLayout(e2, parseLayout(e2, e2.layouts[e2.context.currentType])));
      };
      setVisibilityArrows = (e2, t, n, a) => {
        e2.style.visibility = n ? "hidden" : "", t.style.visibility = a ? "hidden" : "";
      };
      handleDefaultType = (e2, t, n) => {
        const a = getDate(getDateString(new Date(e2.context.selectedYear, e2.context.selectedMonth, 1))), l = new Date(a.getTime()), o = new Date(a.getTime());
        l.setMonth(l.getMonth() - e2.monthsToSwitch), o.setMonth(o.getMonth() + e2.monthsToSwitch);
        const s = getDate(e2.context.dateMin), i = getDate(e2.context.dateMax);
        e2.selectionYearsMode || (s.setFullYear(a.getFullYear()), i.setFullYear(a.getFullYear()));
        const r = !e2.selectionMonthsMode || l.getFullYear() < s.getFullYear() || l.getFullYear() === s.getFullYear() && l.getMonth() < s.getMonth(), c = !e2.selectionMonthsMode || o.getFullYear() > i.getFullYear() || o.getFullYear() === i.getFullYear() && o.getMonth() > i.getMonth() - (e2.context.displayMonthsCount - 1);
        setVisibilityArrows(t, n, r, c);
      };
      handleYearType = (e2, t, n) => {
        const a = getDate(e2.context.dateMin), l = getDate(e2.context.dateMax), o = !!(a.getFullYear() && e2.context.displayYear - 7 <= a.getFullYear()), s = !!(l.getFullYear() && e2.context.displayYear + 7 >= l.getFullYear());
        setVisibilityArrows(t, n, o, s);
      };
      visibilityArrows = (e2) => {
        if ("month" === e2.context.currentType) return;
        const t = e2.context.mainElement.querySelector('[data-vc-arrow="prev"]'), n = e2.context.mainElement.querySelector('[data-vc-arrow="next"]');
        if (!t || !n) return;
        ({ default: () => handleDefaultType(e2, t, n), year: () => handleYearType(e2, t, n) })["multiple" === e2.context.currentType ? "default" : e2.context.currentType]();
      };
      visibilityHandler = (e2, t, n, a, l) => {
        const o = new Date(a.setFullYear(e2.context.selectedYear, e2.context.selectedMonth + n)).getFullYear(), s = new Date(a.setMonth(e2.context.selectedMonth + n)).getMonth(), i = e2.context.locale.months.long[s], r = t.closest('[data-vc="column"]');
        r && (r.ariaLabel = `${i} ${o}`);
        const c = { month: { id: s, label: i }, year: { id: o, label: o } };
        t.innerText = String(c[l].label), t.dataset[`vc${l.charAt(0).toUpperCase() + l.slice(1)}`] = String(c[l].id), t.ariaLabel = `${e2.labels[l]} ${c[l].label}`;
        const d = { month: e2.selectionMonthsMode, year: e2.selectionYearsMode }, u = false === d[l] || "only-arrows" === d[l];
        u && (t.tabIndex = -1), t.disabled = u;
      };
      visibilityTitle = (e2) => {
        const t = e2.context.mainElement.querySelectorAll('[data-vc="month"]'), n = e2.context.mainElement.querySelectorAll('[data-vc="year"]'), a = new Date(e2.context.selectedYear, e2.context.selectedMonth, 1);
        [t, n].forEach(((t2) => null == t2 ? void 0 : t2.forEach(((t3, n2) => visibilityHandler(e2, t3, n2, a, t3.dataset.vc)))));
      };
      setYearModifier = (e2, t, n, a, l) => {
        var o;
        const s = { month: "[data-vc-months-month]", year: "[data-vc-years-year]" }, i = { month: { selected: "data-vc-months-month-selected", aria: "aria-selected", value: "vcMonthsMonth", selectedProperty: "selectedMonth" }, year: { selected: "data-vc-years-year-selected", aria: "aria-selected", value: "vcYearsYear", selectedProperty: "selectedYear" } };
        l && (null == (o = e2.context.mainElement.querySelectorAll(s[n])) || o.forEach(((e3) => {
          e3.removeAttribute(i[n].selected), e3.removeAttribute(i[n].aria);
        })), setContext(e2, i[n].selectedProperty, Number(t.dataset[i[n].value])), visibilityTitle(e2), "year" === n && visibilityArrows(e2)), a && (t.setAttribute(i[n].selected, ""), t.setAttribute(i[n].aria, "true"));
      };
      getColumnID = (e2, t) => {
        var n;
        if ("multiple" !== e2.type) return { currentValue: null, columnID: 0 };
        const a = e2.context.mainElement.querySelectorAll('[data-vc="column"]'), l = Array.from(a).findIndex(((e3) => e3.closest(`[data-vc-column="${t}"]`)));
        return { currentValue: l >= 0 ? Number(null == (n = a[l].querySelector(`[data-vc="${t}"]`)) ? void 0 : n.getAttribute(`data-vc-${t}`)) : null, columnID: Math.max(l, 0) };
      };
      createMonthEl = (e2, t, n, a, l, o, s) => {
        const i = t.cloneNode(false);
        return i.className = e2.styles.monthsMonth, i.innerText = a, i.ariaLabel = l, i.role = "gridcell", i.dataset.vcMonthsMonth = `${s}`, o && (i.ariaDisabled = "true"), o && (i.tabIndex = -1), i.disabled = o, setYearModifier(e2, i, "month", n === s, false), i;
      };
      createMonths = (e2, t) => {
        var n, a;
        const l = null == (n = null == t ? void 0 : t.closest('[data-vc="header"]')) ? void 0 : n.querySelector('[data-vc="year"]'), o = l ? Number(l.dataset.vcYear) : e2.context.selectedYear, s = (null == t ? void 0 : t.dataset.vcMonth) ? Number(t.dataset.vcMonth) : e2.context.selectedMonth;
        setContext(e2, "currentType", "month"), createLayouts(e2, t), visibilityTitle(e2);
        const i = e2.context.mainElement.querySelector('[data-vc="months"]');
        if (!e2.selectionMonthsMode || !i) return;
        const r = e2.monthsToSwitch > 1 ? e2.context.locale.months.long.map(((t2, n2) => s - e2.monthsToSwitch * n2)).concat(e2.context.locale.months.long.map(((t2, n2) => s + e2.monthsToSwitch * n2))).filter(((e3) => e3 >= 0 && e3 <= 12)) : Array.from(Array(12).keys()), c = document.createElement("button");
        c.type = "button";
        for (let t2 = 0; t2 < 12; t2++) {
          const n2 = getDate(e2.context.dateMin), a2 = getDate(e2.context.dateMax), l2 = e2.context.displayMonthsCount - 1, { columnID: d } = getColumnID(e2, "month"), u = o <= n2.getFullYear() && t2 < n2.getMonth() + d || o >= a2.getFullYear() && t2 > a2.getMonth() - l2 + d || o > a2.getFullYear() || t2 !== s && !r.includes(t2), m = createMonthEl(e2, c, s, e2.context.locale.months.short[t2], e2.context.locale.months.long[t2], u, t2);
          i.appendChild(m), e2.onCreateMonthEls && e2.onCreateMonthEls(e2, m);
        }
        null == (a = e2.context.mainElement.querySelector("[data-vc-months-month]:not([disabled])")) || a.focus();
      };
      TimeInput = (e2, t, n, a, l) => `
  <label class="${t}" data-vc-time-input="${e2}">
    <input type="text" name="${e2}" maxlength="2" aria-label="${n[`input${e2.charAt(0).toUpperCase() + e2.slice(1)}`]}" value="${a}" ${l ? "disabled" : ""}>
  </label>
`;
      TimeRange = (e2, t, n, a, l, o, s) => `
  <label class="${t}" data-vc-time-range="${e2}">
    <input type="range" name="${e2}" min="${a}" max="${l}" step="${o}" aria-label="${n[`range${e2.charAt(0).toUpperCase() + e2.slice(1)}`]}" value="${s}">
  </label>
`;
      handleActions = (e2, t, n, a) => {
        ({ hour: () => setContext(e2, "selectedHours", n), minute: () => setContext(e2, "selectedMinutes", n) })[a](), setContext(e2, "selectedTime", `${e2.context.selectedHours}:${e2.context.selectedMinutes}${e2.context.selectedKeeping ? ` ${e2.context.selectedKeeping}` : ""}`), e2.onChangeTime && e2.onChangeTime(e2, t, false), e2.inputMode && e2.context.inputElement && e2.context.mainElement && e2.onChangeToInput && e2.onChangeToInput(e2, t);
      };
      transformTime24 = (e2, t) => {
        var n;
        return (null == (n = { 0: { AM: "00", PM: "12" }, 1: { AM: "01", PM: "13" }, 2: { AM: "02", PM: "14" }, 3: { AM: "03", PM: "15" }, 4: { AM: "04", PM: "16" }, 5: { AM: "05", PM: "17" }, 6: { AM: "06", PM: "18" }, 7: { AM: "07", PM: "19" }, 8: { AM: "08", PM: "20" }, 9: { AM: "09", PM: "21" }, 10: { AM: "10", PM: "22" }, 11: { AM: "11", PM: "23" }, 12: { AM: "00", PM: "12" } }[Number(e2)]) ? void 0 : n[t]) || String(e2);
      };
      handleClickKeepingTime = (e2, t, n, a, l) => {
        const o = (o2) => {
          const s = "AM" === e2.context.selectedKeeping ? "PM" : "AM", i = transformTime24(e2.context.selectedHours, s);
          Number(i) <= a && Number(i) >= l ? (setContext(e2, "selectedKeeping", s), n.value = i, handleActions(e2, o2, e2.context.selectedHours, "hour"), t.ariaLabel = `${e2.labels.btnKeeping} ${e2.context.selectedKeeping}`, t.innerText = e2.context.selectedKeeping) : e2.onChangeTime && e2.onChangeTime(e2, o2, true);
        };
        return t.addEventListener("click", o), () => {
          t.removeEventListener("click", o);
        };
      };
      transformTime12 = (e2) => ({ 0: "12", 13: "01", 14: "02", 15: "03", 16: "04", 17: "05", 18: "06", 19: "07", 20: "08", 21: "09", 22: "10", 23: "11" })[Number(e2)] || String(e2);
      updateInputAndRange = (e2, t, n, a) => {
        e2.value = n, t.value = a;
      };
      updateKeepingTime$1 = (e2, t, n) => {
        t && n && (setContext(e2, "selectedKeeping", n), t.innerText = n);
      };
      handleInput$1 = (e2, t, n, a, l, o, s) => {
        const i = { hour: (i2, r2, c) => {
          if (!e2.selectionTimeMode) return;
          ({ 12: () => {
            if (!e2.context.selectedKeeping) return;
            const d = Number(transformTime24(r2, e2.context.selectedKeeping));
            if (!(d <= o && d >= s)) return updateInputAndRange(n, t, e2.context.selectedHours, e2.context.selectedHours), void (e2.onChangeTime && e2.onChangeTime(e2, c, true));
            updateInputAndRange(n, t, transformTime12(r2), transformTime24(r2, e2.context.selectedKeeping)), i2 > 12 && updateKeepingTime$1(e2, a, "PM"), handleActions(e2, c, transformTime12(r2), l);
          }, 24: () => {
            if (!(i2 <= o && i2 >= s)) return updateInputAndRange(n, t, e2.context.selectedHours, e2.context.selectedHours), void (e2.onChangeTime && e2.onChangeTime(e2, c, true));
            updateInputAndRange(n, t, r2, r2), handleActions(e2, c, r2, l);
          } })[e2.selectionTimeMode]();
        }, minute: (a2, i2, r2) => {
          if (!(a2 <= o && a2 >= s)) return n.value = e2.context.selectedMinutes, void (e2.onChangeTime && e2.onChangeTime(e2, r2, true));
          n.value = i2, t.value = i2, handleActions(e2, r2, i2, l);
        } }, r = (e3) => {
          const t2 = Number(n.value), a2 = n.value.padStart(2, "0");
          i[l] && i[l](t2, a2, e3);
        };
        return n.addEventListener("change", r), () => {
          n.removeEventListener("change", r);
        };
      };
      updateInputAndTime = (e2, t, n, a, l) => {
        t.value = l, handleActions(e2, n, l, a);
      };
      updateKeepingTime = (e2, t, n) => {
        t && (setContext(e2, "selectedKeeping", n), t.innerText = n);
      };
      handleRange = (e2, t, n, a, l) => {
        const o = (o2) => {
          const s = Number(t.value), i = t.value.padStart(2, "0"), r = "hour" === l, c = 24 === e2.selectionTimeMode, d = s > 0 && s < 12;
          r && !c && updateKeepingTime(e2, a, 0 === s || d ? "AM" : "PM"), updateInputAndTime(e2, n, o2, l, !r || c || d ? i : transformTime12(t.value));
        };
        return t.addEventListener("input", o), () => {
          t.removeEventListener("input", o);
        };
      };
      handleMouseOver = (e2) => e2.setAttribute("data-vc-input-focus", "");
      handleMouseOut = (e2) => e2.removeAttribute("data-vc-input-focus");
      handleTime = (e2, t) => {
        const n = t.querySelector('[data-vc-time-range="hour"] input[name="hour"]'), a = t.querySelector('[data-vc-time-range="minute"] input[name="minute"]'), l = t.querySelector('[data-vc-time-input="hour"] input[name="hour"]'), o = t.querySelector('[data-vc-time-input="minute"] input[name="minute"]'), s = t.querySelector('[data-vc-time="keeping"]');
        if (!(n && a && l && o)) return;
        const i = (e3) => {
          e3.target === n && handleMouseOver(l), e3.target === a && handleMouseOver(o);
        }, r = (e3) => {
          e3.target === n && handleMouseOut(l), e3.target === a && handleMouseOut(o);
        };
        return t.addEventListener("mouseover", i), t.addEventListener("mouseout", r), handleInput$1(e2, n, l, s, "hour", e2.timeMaxHour, e2.timeMinHour), handleInput$1(e2, a, o, s, "minute", e2.timeMaxMinute, e2.timeMinMinute), handleRange(e2, n, l, s, "hour"), handleRange(e2, a, o, s, "minute"), s && handleClickKeepingTime(e2, s, n, e2.timeMaxHour, e2.timeMinHour), () => {
          t.removeEventListener("mouseover", i), t.removeEventListener("mouseout", r);
        };
      };
      createTime = (e2) => {
        const t = e2.context.mainElement.querySelector('[data-vc="time"]');
        if (!e2.selectionTimeMode || !t) return;
        const [n, a] = [e2.timeMinHour, e2.timeMaxHour], [l, o] = [e2.timeMinMinute, e2.timeMaxMinute], s = e2.context.selectedKeeping ? transformTime24(e2.context.selectedHours, e2.context.selectedKeeping) : e2.context.selectedHours, i = "range" === e2.timeControls;
        var r;
        t.innerHTML = e2.sanitizerHTML(`
    <div class="${e2.styles.timeContent}" data-vc-time="content">
      ${TimeInput("hour", e2.styles.timeHour, e2.labels, e2.context.selectedHours, i)}
      ${TimeInput("minute", e2.styles.timeMinute, e2.labels, e2.context.selectedMinutes, i)}
      ${12 === e2.selectionTimeMode ? (r = e2.context.selectedKeeping, `<button type="button" class="${e2.styles.timeKeeping}" aria-label="${e2.labels.btnKeeping} ${r}" data-vc-time="keeping" ${i ? "disabled" : ""}>${r}</button>`) : ""}
    </div>
    <div class="${e2.styles.timeRanges}" data-vc-time="ranges">
      ${TimeRange("hour", e2.styles.timeRange, e2.labels, n, a, e2.timeStepHour, s)}
      ${TimeRange("minute", e2.styles.timeRange, e2.labels, l, o, e2.timeStepMinute, e2.context.selectedMinutes)}
    </div>
  `), handleTime(e2, t);
      };
      createWeek = (e2) => {
        const t = e2.selectedWeekends ? [...e2.selectedWeekends] : [], n = [...e2.context.locale.weekdays.long].reduce(((n2, a2, l) => [...n2, { id: l, titleShort: e2.context.locale.weekdays.short[l], titleLong: a2, isWeekend: t.includes(l) }]), []), a = [...n.slice(e2.firstWeekday), ...n.slice(0, e2.firstWeekday)];
        e2.context.mainElement.querySelectorAll('[data-vc="week"]').forEach(((t2) => {
          const n2 = e2.onClickWeekDay ? document.createElement("button") : document.createElement("b");
          e2.onClickWeekDay && (n2.type = "button"), a.forEach(((a2) => {
            const l = n2.cloneNode(true);
            l.innerText = a2.titleShort, l.className = e2.styles.weekDay, l.role = "columnheader", l.ariaLabel = a2.titleLong, l.dataset.vcWeekDay = String(a2.id), a2.isWeekend && (l.dataset.vcWeekDayOff = ""), t2.appendChild(l);
          }));
        }));
      };
      createYearEl = (e2, t, n, a, l) => {
        const o = t.cloneNode(false);
        return o.className = e2.styles.yearsYear, o.innerText = String(l), o.ariaLabel = String(l), o.role = "gridcell", o.dataset.vcYearsYear = `${l}`, a && (o.ariaDisabled = "true"), a && (o.tabIndex = -1), o.disabled = a, setYearModifier(e2, o, "year", n === l, false), o;
      };
      createYears = (e2, t) => {
        var n;
        const a = (null == t ? void 0 : t.dataset.vcYear) ? Number(t.dataset.vcYear) : e2.context.selectedYear;
        setContext(e2, "currentType", "year"), createLayouts(e2, t), visibilityTitle(e2), visibilityArrows(e2);
        const l = e2.context.mainElement.querySelector('[data-vc="years"]');
        if (!e2.selectionYearsMode || !l) return;
        const o = "multiple" !== e2.type || e2.context.selectedYear === a ? 0 : 1, s = document.createElement("button");
        s.type = "button";
        for (let t2 = e2.context.displayYear - 7; t2 < e2.context.displayYear + 8; t2++) {
          const n2 = t2 < getDate(e2.context.dateMin).getFullYear() + o || t2 > getDate(e2.context.dateMax).getFullYear(), i = createYearEl(e2, s, a, n2, t2);
          l.appendChild(i), e2.onCreateYearEls && e2.onCreateYearEls(e2, i);
        }
        null == (n = e2.context.mainElement.querySelector("[data-vc-years-year]:not([disabled])")) || n.focus();
      };
      trackChangesHTMLElement = (e2, t, n) => {
        new MutationObserver(((e3) => {
          for (let a = 0; a < e3.length; a++) {
            if (e3[a].attributeName === t) {
              n();
              break;
            }
          }
        })).observe(e2, { attributes: true });
      };
      haveListener = { value: false, set: () => haveListener.value = true, check: () => haveListener.value };
      setTheme = (e2, t) => e2.dataset.vcTheme = t;
      trackChangesThemeInSystemSettings = (e2, t) => {
        if (setTheme(e2.context.mainElement, t.matches ? "dark" : "light"), "system" !== e2.selectedTheme || haveListener.check()) return;
        const n = (e3) => {
          const t2 = document.querySelectorAll('[data-vc="calendar"]');
          null == t2 || t2.forEach(((t3) => setTheme(t3, e3.matches ? "dark" : "light")));
        };
        t.addEventListener ? t.addEventListener("change", n) : t.addListener(n), haveListener.set();
      };
      detectTheme = (e2, t) => {
        const n = e2.themeAttrDetect.length ? document.querySelector(e2.themeAttrDetect) : null, a = e2.themeAttrDetect.replace(/^.*\[(.+)\]/g, ((e3, t2) => t2));
        if (!n || "system" === n.getAttribute(a)) return void trackChangesThemeInSystemSettings(e2, t);
        const l = n.getAttribute(a);
        l ? (setTheme(e2.context.mainElement, l), trackChangesHTMLElement(n, a, (() => {
          const t2 = n.getAttribute(a);
          t2 && setTheme(e2.context.mainElement, t2);
        }))) : trackChangesThemeInSystemSettings(e2, t);
      };
      handleTheme = (e2) => {
        "not all" !== window.matchMedia("(prefers-color-scheme)").media ? "system" === e2.selectedTheme ? detectTheme(e2, window.matchMedia("(prefers-color-scheme: dark)")) : setTheme(e2.context.mainElement, e2.selectedTheme) : setTheme(e2.context.mainElement, "light");
      };
      capitalizeFirstLetter = (e2) => e2.charAt(0).toUpperCase() + e2.slice(1).replace(/\./, "");
      getLocaleWeekday = (e2, t, n) => {
        const a = /* @__PURE__ */ new Date(`1978-01-0${t + 1}T00:00:00.000Z`), l = a.toLocaleString(n, { weekday: "short", timeZone: "UTC" }), o = a.toLocaleString(n, { weekday: "long", timeZone: "UTC" });
        e2.context.locale.weekdays.short.push(capitalizeFirstLetter(l)), e2.context.locale.weekdays.long.push(capitalizeFirstLetter(o));
      };
      getLocaleMonth = (e2, t, n) => {
        const a = /* @__PURE__ */ new Date(`1978-${String(t + 1).padStart(2, "0")}-01T00:00:00.000Z`), l = a.toLocaleString(n, { month: "short", timeZone: "UTC" }), o = a.toLocaleString(n, { month: "long", timeZone: "UTC" });
        e2.context.locale.months.short.push(capitalizeFirstLetter(l)), e2.context.locale.months.long.push(capitalizeFirstLetter(o));
      };
      getLocale = (e2) => {
        var t, n, a, l, o, s, i, r;
        if (!(e2.context.locale.weekdays.short[6] && e2.context.locale.weekdays.long[6] && e2.context.locale.months.short[11] && e2.context.locale.months.long[11])) if ("string" == typeof e2.locale) {
          if ("string" == typeof e2.locale && !e2.locale.length) throw new Error(errorMessages.notLocale);
          Array.from({ length: 7 }, ((t2, n2) => getLocaleWeekday(e2, n2, e2.locale))), Array.from({ length: 12 }, ((t2, n2) => getLocaleMonth(e2, n2, e2.locale)));
        } else {
          if (!((null == (n = null == (t = e2.locale) ? void 0 : t.weekdays) ? void 0 : n.short[6]) && (null == (l = null == (a = e2.locale) ? void 0 : a.weekdays) ? void 0 : l.long[6]) && (null == (s = null == (o = e2.locale) ? void 0 : o.months) ? void 0 : s.short[11]) && (null == (r = null == (i = e2.locale) ? void 0 : i.months) ? void 0 : r.long[11]))) throw new Error(errorMessages.notLocale);
          setContext(e2, "locale", __spreadValues({}, e2.locale));
        }
      };
      create = (e2) => {
        const t = { default: () => {
          createWeek(e2), createDates(e2);
        }, multiple: () => {
          createWeek(e2), createDates(e2);
        }, month: () => createMonths(e2), year: () => createYears(e2) };
        handleTheme(e2), getLocale(e2), createLayouts(e2), visibilityTitle(e2), visibilityArrows(e2), createTime(e2), t[e2.context.currentType]();
      };
      handleArrowKeys = (e2) => {
        const t = (t2) => {
          var n;
          const a = t2.target;
          if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(t2.key) || "button" !== a.localName) return;
          const l = Array.from(e2.context.mainElement.querySelectorAll('[data-vc="calendar"] button')), o = l.indexOf(a);
          if (-1 === o) return;
          const s = (i = l[o]).hasAttribute("data-vc-date-btn") ? 7 : i.hasAttribute("data-vc-months-month") ? 4 : i.hasAttribute("data-vc-years-year") ? 5 : 1;
          var i;
          const r = (0, { ArrowUp: () => Math.max(0, o - s), ArrowDown: () => Math.min(l.length - 1, o + s), ArrowLeft: () => Math.max(0, o - 1), ArrowRight: () => Math.min(l.length - 1, o + 1) }[t2.key])();
          null == (n = l[r]) || n.focus();
        };
        return e2.context.mainElement.addEventListener("keydown", t), () => e2.context.mainElement.removeEventListener("keydown", t);
      };
      handleMonth = (e2, t) => {
        const n = getDate(getDateString(new Date(e2.context.selectedYear, e2.context.selectedMonth, 1)));
        ({ prev: () => n.setMonth(n.getMonth() - e2.monthsToSwitch), next: () => n.setMonth(n.getMonth() + e2.monthsToSwitch) })[t](), setContext(e2, "selectedMonth", n.getMonth()), setContext(e2, "selectedYear", n.getFullYear()), visibilityTitle(e2), visibilityArrows(e2), createDates(e2);
      };
      handleClickArrow = (e2, t) => {
        const n = t.target.closest("[data-vc-arrow]");
        if (n) {
          if (["default", "multiple"].includes(e2.context.currentType)) handleMonth(e2, n.dataset.vcArrow);
          else if ("year" === e2.context.currentType && void 0 !== e2.context.displayYear) {
            const a = { prev: -15, next: 15 }[n.dataset.vcArrow];
            setContext(e2, "displayYear", e2.context.displayYear + a), createYears(e2, t.target);
          }
          e2.onClickArrow && e2.onClickArrow(e2, t);
        }
      };
      canToggleSelection = (e2) => void 0 === e2.enableDateToggle || ("function" == typeof e2.enableDateToggle ? e2.enableDateToggle(e2) : e2.enableDateToggle);
      handleSelectDate = (e2, t, n) => {
        const a = t.dataset.vcDate, l = t.closest("[data-vc-date][data-vc-date-selected]"), o = canToggleSelection(e2);
        if (l && !o) return;
        const s = l ? e2.context.selectedDates.filter(((e3) => e3 !== a)) : n ? [...e2.context.selectedDates, a] : [a];
        setContext(e2, "selectedDates", s);
      };
      createDateRangeTooltip = (e2, t, n) => {
        if (!t) return;
        if (!n) return t.dataset.vcDateRangeTooltip = "hidden", void (t.textContent = "");
        const a = e2.context.mainElement.getBoundingClientRect(), l = n.getBoundingClientRect();
        t.style.left = l.left - a.left + l.width / 2 + "px", t.style.top = l.bottom - a.top - l.height + "px", t.dataset.vcDateRangeTooltip = "visible", t.innerHTML = e2.sanitizerHTML(e2.onCreateDateRangeTooltip(e2, n, t, l, a));
      };
      state = { self: null, lastDateEl: null, isHovering: false, rangeMin: void 0, rangeMax: void 0, tooltipEl: null, timeoutId: null };
      addHoverEffect = (e2, t, n) => {
        var a, l, o;
        if (!(null == (l = null == (a = state.self) ? void 0 : a.context) ? void 0 : l.selectedDates[0])) return;
        const s = getDateString(e2);
        (null == (o = state.self.context.disableDates) ? void 0 : o.includes(s)) || (state.self.context.mainElement.querySelectorAll(`[data-vc-date="${s}"]`).forEach(((e3) => e3.dataset.vcDateHover = "")), t.forEach(((e3) => e3.dataset.vcDateHover = "first")), n.forEach(((e3) => {
          "first" === e3.dataset.vcDateHover ? e3.dataset.vcDateHover = "first-and-last" : e3.dataset.vcDateHover = "last";
        })));
      };
      removeHoverEffect = () => {
        var e2, t;
        if (!(null == (t = null == (e2 = state.self) ? void 0 : e2.context) ? void 0 : t.mainElement)) return;
        state.self.context.mainElement.querySelectorAll("[data-vc-date-hover]").forEach(((e3) => e3.removeAttribute("data-vc-date-hover")));
      };
      handleHoverDatesEvent = (e2) => {
        var t, n;
        if (!e2 || !(null == (n = null == (t = state.self) ? void 0 : t.context) ? void 0 : n.selectedDates[0])) return;
        if (!e2.closest('[data-vc="dates"]')) return state.lastDateEl = null, createDateRangeTooltip(state.self, state.tooltipEl, null), void removeHoverEffect();
        const a = e2.closest("[data-vc-date]");
        if (!a || state.lastDateEl === a) return;
        state.lastDateEl = a, createDateRangeTooltip(state.self, state.tooltipEl, a), removeHoverEffect();
        const l = a.dataset.vcDate, o = getDate(state.self.context.selectedDates[0]), s = getDate(l), i = state.self.context.mainElement.querySelectorAll(`[data-vc-date="${state.self.context.selectedDates[0]}"]`), r = state.self.context.mainElement.querySelectorAll(`[data-vc-date="${l}"]`), [c, d] = o < s ? [i, r] : [r, i], [u, m] = o < s ? [o, s] : [s, o];
        for (let e3 = new Date(u); e3 <= m; e3.setDate(e3.getDate() + 1)) addHoverEffect(e3, c, d);
      };
      handleHoverSelectedDatesRangeEvent = (e2) => {
        const t = null == e2 ? void 0 : e2.closest("[data-vc-date-selected]");
        if (!t && state.lastDateEl) return state.lastDateEl = null, void createDateRangeTooltip(state.self, state.tooltipEl, null);
        t && state.lastDateEl !== t && (state.lastDateEl = t, createDateRangeTooltip(state.self, state.tooltipEl, t));
      };
      optimizedHoverHandler = (e2) => (t) => {
        const n = t.target;
        state.isHovering || (state.isHovering = true, requestAnimationFrame((() => {
          e2(n), state.isHovering = false;
        })));
      };
      optimizedHandleHoverDatesEvent = optimizedHoverHandler(handleHoverDatesEvent);
      optimizedHandleHoverSelectedDatesRangeEvent = optimizedHoverHandler(handleHoverSelectedDatesRangeEvent);
      handleCancelSelectionDates = (e2) => {
        state.self && "Escape" === e2.key && (state.lastDateEl = null, setContext(state.self, "selectedDates", []), state.self.context.mainElement.removeEventListener("mousemove", optimizedHandleHoverDatesEvent), state.self.context.mainElement.removeEventListener("keydown", handleCancelSelectionDates), createDateRangeTooltip(state.self, state.tooltipEl, null), removeHoverEffect());
      };
      handleMouseLeave = () => {
        null !== state.timeoutId && clearTimeout(state.timeoutId), state.timeoutId = setTimeout((() => {
          state.lastDateEl = null, createDateRangeTooltip(state.self, state.tooltipEl, null), removeHoverEffect();
        }), 50);
      };
      updateDisabledDates = () => {
        var e2, t, n, a;
        if (!(null == (n = null == (t = null == (e2 = state.self) ? void 0 : e2.context) ? void 0 : t.selectedDates) ? void 0 : n[0]) || !(null == (a = state.self.context.disableDates) ? void 0 : a[0])) return;
        const l = getDate(state.self.context.selectedDates[0]), [o, s] = state.self.context.disableDates.map(((e3) => getDate(e3))).reduce((([e3, t2], n2) => [l >= n2 ? n2 : e3, l < n2 && null === t2 ? n2 : t2]), [null, null]);
        o && setContext(state.self, "displayDateMin", getDateString(new Date(o.setDate(o.getDate() + 1)))), s && setContext(state.self, "displayDateMax", getDateString(new Date(s.setDate(s.getDate() - 1))));
        state.self.disableDatesPast && !state.self.disableAllDates && getDate(state.self.context.displayDateMin) < getDate(state.self.context.dateToday) && setContext(state.self, "displayDateMin", state.self.context.dateToday);
      };
      handleSelectDateRange = (e2, t) => {
        state.self = e2, state.lastDateEl = t, removeHoverEffect(), e2.disableDatesGaps && (state.rangeMin = state.rangeMin ? state.rangeMin : e2.context.displayDateMin, state.rangeMax = state.rangeMax ? state.rangeMax : e2.context.displayDateMax), e2.onCreateDateRangeTooltip && (state.tooltipEl = e2.context.mainElement.querySelector("[data-vc-date-range-tooltip]"));
        const n = null == t ? void 0 : t.dataset.vcDate;
        if (n) {
          const t2 = 1 === e2.context.selectedDates.length && e2.context.selectedDates[0].includes(n), a = t2 && !canToggleSelection(e2) ? [n, n] : t2 && canToggleSelection(e2) ? [] : e2.context.selectedDates.length > 1 ? [n] : [...e2.context.selectedDates, n];
          setContext(e2, "selectedDates", a), e2.context.selectedDates.length > 1 && e2.context.selectedDates.sort(((e3, t3) => +new Date(e3) - +new Date(t3)));
        }
        ({ set: () => (e2.disableDatesGaps && updateDisabledDates(), createDateRangeTooltip(state.self, state.tooltipEl, t), state.self.context.mainElement.removeEventListener("mousemove", optimizedHandleHoverSelectedDatesRangeEvent), state.self.context.mainElement.removeEventListener("mouseleave", handleMouseLeave), state.self.context.mainElement.removeEventListener("keydown", handleCancelSelectionDates), state.self.context.mainElement.addEventListener("mousemove", optimizedHandleHoverDatesEvent), state.self.context.mainElement.addEventListener("mouseleave", handleMouseLeave), state.self.context.mainElement.addEventListener("keydown", handleCancelSelectionDates), () => {
          state.self.context.mainElement.removeEventListener("mousemove", optimizedHandleHoverDatesEvent), state.self.context.mainElement.removeEventListener("mouseleave", handleMouseLeave), state.self.context.mainElement.removeEventListener("keydown", handleCancelSelectionDates);
        }), reset: () => {
          const [n2, a] = [e2.context.selectedDates[0], e2.context.selectedDates[e2.context.selectedDates.length - 1]], l = e2.context.selectedDates[0] !== e2.context.selectedDates[e2.context.selectedDates.length - 1], o = parseDates([`${n2}:${a}`]).filter(((t2) => !e2.context.disableDates.includes(t2))), s = l ? e2.enableEdgeDatesOnly ? [n2, a] : o : [e2.context.selectedDates[0], e2.context.selectedDates[0]];
          if (setContext(e2, "selectedDates", s), e2.disableDatesGaps && (setContext(e2, "displayDateMin", state.rangeMin), setContext(e2, "displayDateMax", state.rangeMax)), state.self.context.mainElement.removeEventListener("mousemove", optimizedHandleHoverDatesEvent), state.self.context.mainElement.removeEventListener("mouseleave", handleMouseLeave), state.self.context.mainElement.removeEventListener("keydown", handleCancelSelectionDates), e2.onCreateDateRangeTooltip) return e2.context.selectedDates[0] || (state.self.context.mainElement.removeEventListener("mousemove", optimizedHandleHoverSelectedDatesRangeEvent), state.self.context.mainElement.removeEventListener("mouseleave", handleMouseLeave), createDateRangeTooltip(state.self, state.tooltipEl, null)), e2.context.selectedDates[0] && (state.self.context.mainElement.addEventListener("mousemove", optimizedHandleHoverSelectedDatesRangeEvent), state.self.context.mainElement.addEventListener("mouseleave", handleMouseLeave), createDateRangeTooltip(state.self, state.tooltipEl, t)), () => {
            state.self.context.mainElement.removeEventListener("mousemove", optimizedHandleHoverSelectedDatesRangeEvent), state.self.context.mainElement.removeEventListener("mouseleave", handleMouseLeave);
          };
        } })[1 === e2.context.selectedDates.length ? "set" : "reset"]();
      };
      updateDateModifier = (e2) => {
        e2.context.mainElement.querySelectorAll("[data-vc-date]").forEach(((t) => {
          const n = t.querySelector("[data-vc-date-btn]"), a = t.dataset.vcDate, l = getDate(a).getDay();
          setDateModifier(e2, e2.context.selectedYear, t, n, l, a, "current");
        }));
      };
      handleClickDate = (e2, t) => {
        var n;
        const a = t.target, l = a.closest("[data-vc-date-btn]");
        if (!e2.selectionDatesMode || !["single", "multiple", "multiple-ranged"].includes(e2.selectionDatesMode) || !l) return;
        const o = l.closest("[data-vc-date]");
        ({ single: () => handleSelectDate(e2, o, false), multiple: () => handleSelectDate(e2, o, true), "multiple-ranged": () => handleSelectDateRange(e2, o) })[e2.selectionDatesMode](), null == (n = e2.context.selectedDates) || n.sort(((e3, t2) => +new Date(e3) - +new Date(t2))), e2.onClickDate && e2.onClickDate(e2, t), e2.inputMode && e2.context.inputElement && e2.context.mainElement && e2.onChangeToInput && e2.onChangeToInput(e2, t);
        const s = a.closest('[data-vc-date-month="prev"]'), i = a.closest('[data-vc-date-month="next"]');
        ({ prev: () => e2.enableMonthChangeOnDayClick ? handleMonth(e2, "prev") : updateDateModifier(e2), next: () => e2.enableMonthChangeOnDayClick ? handleMonth(e2, "next") : updateDateModifier(e2), current: () => updateDateModifier(e2) })[s ? "prev" : i ? "next" : "current"]();
      };
      typeClick = ["month", "year"];
      getValue = (e2, t, n) => {
        const { currentValue: a, columnID: l } = getColumnID(e2, t);
        return "month" === e2.context.currentType && l >= 0 ? n - l : "year" === e2.context.currentType && e2.context.selectedYear !== a ? n - 1 : n;
      };
      handleMultipleYearSelection = (e2, t) => {
        const n = getValue(e2, "year", Number(t.dataset.vcYearsYear)), a = getDate(e2.context.dateMin), l = getDate(e2.context.dateMax), o = e2.context.displayMonthsCount - 1, { columnID: s } = getColumnID(e2, "year"), i = e2.context.selectedMonth < a.getMonth() && n <= a.getFullYear(), r = e2.context.selectedMonth > l.getMonth() - o + s && n >= l.getFullYear(), c = n < a.getFullYear(), d = n > l.getFullYear(), u = i || c ? a.getFullYear() : r || d ? l.getFullYear() : n, m = i || c ? a.getMonth() : r || d ? l.getMonth() - o + s : e2.context.selectedMonth;
        setContext(e2, "selectedYear", u), setContext(e2, "selectedMonth", m);
      };
      handleMultipleMonthSelection = (e2, t) => {
        const n = t.closest('[data-vc-column="month"]').querySelector('[data-vc="year"]'), a = getValue(e2, "month", Number(t.dataset.vcMonthsMonth)), l = Number(n.dataset.vcYear), o = getDate(e2.context.dateMin), s = getDate(e2.context.dateMax), i = a < o.getMonth() && l <= o.getFullYear(), r = a > s.getMonth() && l >= s.getFullYear();
        setContext(e2, "selectedYear", l), setContext(e2, "selectedMonth", i ? o.getMonth() : r ? s.getMonth() : a);
      };
      handleItemClick = (e2, t, n, a) => {
        var l;
        ({ year: () => {
          if ("multiple" === e2.type) return handleMultipleYearSelection(e2, a);
          setContext(e2, "selectedYear", Number(a.dataset.vcYearsYear));
        }, month: () => {
          if ("multiple" === e2.type) return handleMultipleMonthSelection(e2, a);
          setContext(e2, "selectedMonth", Number(a.dataset.vcMonthsMonth));
        } })[n]();
        ({ year: () => {
          var n2;
          return null == (n2 = e2.onClickYear) ? void 0 : n2.call(e2, e2, t);
        }, month: () => {
          var n2;
          return null == (n2 = e2.onClickMonth) ? void 0 : n2.call(e2, e2, t);
        } })[n](), e2.context.currentType !== e2.type ? (setContext(e2, "currentType", e2.type), create(e2), null == (l = e2.context.mainElement.querySelector(`[data-vc="${n}"]`)) || l.focus()) : setYearModifier(e2, a, n, true, true);
      };
      handleClickType = (e2, t, n) => {
        var a;
        const l = t.target, o = l.closest(`[data-vc="${n}"]`), s = { year: () => createYears(e2, l), month: () => createMonths(e2, l) };
        if (o && e2.onClickTitle && e2.onClickTitle(e2, t), o && e2.context.currentType !== n) return s[n]();
        const i = l.closest(`[data-vc-${n}s-${n}]`);
        if (i) return handleItemClick(e2, t, n, i);
        const r = l.closest('[data-vc="grid"]'), c = l.closest('[data-vc="column"]');
        (e2.context.currentType === n && o || "multiple" === e2.type && e2.context.currentType === n && r && !c) && (setContext(e2, "currentType", e2.type), create(e2), null == (a = e2.context.mainElement.querySelector(`[data-vc="${n}"]`)) || a.focus());
      };
      handleClickMonthOrYear = (e2, t) => {
        const n = { month: e2.selectionMonthsMode, year: e2.selectionYearsMode };
        typeClick.forEach(((a) => {
          n[a] && t.target && handleClickType(e2, t, a);
        }));
      };
      handleClickWeekNumber = (e2, t) => {
        if (!e2.enableWeekNumbers || !e2.onClickWeekNumber) return;
        const n = t.target.closest("[data-vc-week-number]"), a = e2.context.mainElement.querySelectorAll("[data-vc-date-week-number]");
        if (!n || !a[0]) return;
        const l = Number(n.innerText), o = Number(n.dataset.vcWeekYear), s = Array.from(a).filter(((e3) => Number(e3.dataset.vcDateWeekNumber) === l));
        e2.onClickWeekNumber(e2, l, o, s, t);
      };
      handleClickWeekDay = (e2, t) => {
        if (!e2.onClickWeekDay) return;
        const n = t.target.closest("[data-vc-week-day]"), a = t.target.closest('[data-vc="column"]'), l = a ? a.querySelectorAll("[data-vc-date-week-day]") : e2.context.mainElement.querySelectorAll("[data-vc-date-week-day]");
        if (!n || !l[0]) return;
        const o = Number(n.dataset.vcWeekDay), s = Array.from(l).filter(((e3) => Number(e3.dataset.vcDateWeekDay) === o));
        e2.onClickWeekDay(e2, o, s, t);
      };
      handleClick = (e2) => {
        const t = (t2) => {
          handleClickArrow(e2, t2), handleClickWeekDay(e2, t2), handleClickWeekNumber(e2, t2), handleClickDate(e2, t2), handleClickMonthOrYear(e2, t2);
        };
        return e2.context.mainElement.addEventListener("click", t), () => e2.context.mainElement.removeEventListener("click", t);
      };
      initMonthsCount = (e2) => {
        if ("multiple" === e2.type && (e2.displayMonthsCount <= 1 || e2.displayMonthsCount > 12)) throw new Error(errorMessages.incorrectMonthsCount);
        if ("multiple" !== e2.type && e2.displayMonthsCount > 1) throw new Error(errorMessages.incorrectMonthsCount);
        setContext(e2, "displayMonthsCount", e2.displayMonthsCount ? e2.displayMonthsCount : "multiple" === e2.type ? 2 : 1);
      };
      getLocalDate = () => {
        const e2 = /* @__PURE__ */ new Date();
        return new Date(e2.getTime() - 6e4 * e2.getTimezoneOffset()).toISOString().substring(0, 10);
      };
      resolveDate = (e2, t) => "today" === e2 ? getLocalDate() : e2 instanceof Date || "number" == typeof e2 || "string" == typeof e2 ? parseDates([e2])[0] : t;
      initRange = (e2) => {
        var t, n, a;
        const l = resolveDate(e2.dateMin, e2.dateMin), o = resolveDate(e2.dateMax, e2.dateMax), s = resolveDate(e2.displayDateMin, l), i = resolveDate(e2.displayDateMax, o);
        setContext(e2, "dateToday", resolveDate(e2.dateToday, e2.dateToday)), setContext(e2, "displayDateMin", s ? getDate(l) >= getDate(s) ? l : s : l), setContext(e2, "displayDateMax", i ? getDate(o) <= getDate(i) ? o : i : o);
        const r = e2.disableDatesPast && !e2.disableAllDates && getDate(s) < getDate(e2.context.dateToday);
        setContext(e2, "displayDateMin", r || e2.disableAllDates ? e2.context.dateToday : s), setContext(e2, "displayDateMax", e2.disableAllDates ? e2.context.dateToday : i), setContext(e2, "disableDates", e2.disableDates[0] && !e2.disableAllDates ? parseDates(e2.disableDates) : e2.disableAllDates ? [e2.context.displayDateMin] : []), e2.context.disableDates.length > 1 && e2.context.disableDates.sort(((e3, t2) => +new Date(e3) - +new Date(t2))), setContext(e2, "enableDates", e2.enableDates[0] ? parseDates(e2.enableDates) : []), (null == (t = e2.context.enableDates) ? void 0 : t[0]) && (null == (n = e2.context.disableDates) ? void 0 : n[0]) && setContext(e2, "disableDates", e2.context.disableDates.filter(((t2) => !e2.context.enableDates.includes(t2)))), e2.context.enableDates.length > 1 && e2.context.enableDates.sort(((e3, t2) => +new Date(e3) - +new Date(t2))), (null == (a = e2.context.enableDates) ? void 0 : a[0]) && e2.disableAllDates && (setContext(e2, "displayDateMin", e2.context.enableDates[0]), setContext(e2, "displayDateMax", e2.context.enableDates[e2.context.enableDates.length - 1])), setContext(e2, "dateMin", e2.displayDisabledDates ? l : e2.context.displayDateMin), setContext(e2, "dateMax", e2.displayDisabledDates ? o : e2.context.displayDateMax);
      };
      initSelectedDates = (e2) => {
        var t;
        setContext(e2, "selectedDates", (null == (t = e2.selectedDates) ? void 0 : t[0]) ? parseDates(e2.selectedDates) : []);
      };
      displayClosestValidDate = (e2) => {
        const t = (t2) => {
          const n2 = new Date(t2);
          setInitialContext(e2, n2.getMonth(), n2.getFullYear());
        };
        if (e2.displayDateMin && "today" !== e2.displayDateMin && (n = e2.displayDateMin, a = /* @__PURE__ */ new Date(), new Date(n).getTime() > a.getTime())) {
          const n2 = e2.selectedDates.length && e2.selectedDates[0] ? parseDates(e2.selectedDates)[0] : e2.displayDateMin;
          return t(getDate(resolveDate(n2, e2.displayDateMin))), true;
        }
        var n, a;
        if (e2.displayDateMax && "today" !== e2.displayDateMax && ((e3, t2) => new Date(e3).getTime() < t2.getTime())(e2.displayDateMax, /* @__PURE__ */ new Date())) {
          const n2 = e2.selectedDates.length && e2.selectedDates[0] ? parseDates(e2.selectedDates)[0] : e2.displayDateMax;
          return t(getDate(resolveDate(n2, e2.displayDateMax))), true;
        }
        return false;
      };
      setInitialContext = (e2, t, n) => {
        setContext(e2, "selectedMonth", t), setContext(e2, "selectedYear", n), setContext(e2, "displayYear", n);
      };
      initSelectedMonthYear = (e2) => {
        var t;
        if (e2.enableJumpToSelectedDate && (null == (t = e2.selectedDates) ? void 0 : t[0]) && void 0 === e2.selectedMonth && void 0 === e2.selectedYear) {
          const t2 = getDate(parseDates(e2.selectedDates)[0]);
          return void setInitialContext(e2, t2.getMonth(), t2.getFullYear());
        }
        if (displayClosestValidDate(e2)) return;
        const n = void 0 !== e2.selectedMonth && Number(e2.selectedMonth) >= 0 && Number(e2.selectedMonth) < 12, a = void 0 !== e2.selectedYear && Number(e2.selectedYear) >= 0 && Number(e2.selectedYear) <= 9999;
        setInitialContext(e2, n ? Number(e2.selectedMonth) : getDate(e2.context.dateToday).getMonth(), a ? Number(e2.selectedYear) : getDate(e2.context.dateToday).getFullYear());
      };
      initTime = (e2) => {
        var t, n, a;
        if (!e2.selectionTimeMode) return;
        if (![12, 24].includes(e2.selectionTimeMode)) throw new Error(errorMessages.incorrectTime);
        const l = 12 === e2.selectionTimeMode, o = l ? /^(0[1-9]|1[0-2]):([0-5][0-9]) ?(AM|PM)?$/i : /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        let [s, i, r] = null != (a = null == (n = null == (t = e2.selectedTime) ? void 0 : t.match(o)) ? void 0 : n.slice(1)) ? a : [];
        s ? l && !r && (r = "AM") : (s = l ? transformTime12(String(e2.timeMinHour)) : String(e2.timeMinHour), i = String(e2.timeMinMinute), r = l ? Number(transformTime12(String(e2.timeMinHour))) >= 12 ? "PM" : "AM" : null), setContext(e2, "selectedHours", s.padStart(2, "0")), setContext(e2, "selectedMinutes", i.padStart(2, "0")), setContext(e2, "selectedKeeping", r), setContext(e2, "selectedTime", `${e2.context.selectedHours}:${e2.context.selectedMinutes}${r ? ` ${r}` : ""}`);
      };
      initAllVariables = (e2) => {
        setContext(e2, "currentType", e2.type), initMonthsCount(e2), initRange(e2), initSelectedMonthYear(e2), initSelectedDates(e2), initTime(e2);
      };
      reset = (e2, { year: t, month: n, dates: a, time: l, locale: o }, s = true) => {
        var i;
        const r = { year: e2.selectedYear, month: e2.selectedMonth, dates: e2.selectedDates, time: e2.selectedTime };
        if (e2.selectedYear = t ? r.year : e2.context.selectedYear, e2.selectedMonth = n ? r.month : e2.context.selectedMonth, e2.selectedTime = l ? r.time : e2.context.selectedTime, e2.selectedDates = "only-first" === a && (null == (i = e2.context.selectedDates) ? void 0 : i[0]) ? [e2.context.selectedDates[0]] : true === a ? r.dates : e2.context.selectedDates, o) {
          setContext(e2, "locale", { months: { short: [], long: [] }, weekdays: { short: [], long: [] } });
        }
        initAllVariables(e2), s && create(e2), e2.selectedYear = r.year, e2.selectedMonth = r.month, e2.selectedDates = r.dates, e2.selectedTime = r.time, "multiple-ranged" === e2.selectionDatesMode && a && handleSelectDateRange(e2, null);
      };
      createToInput = (e2) => {
        const t = document.createElement("div");
        return t.className = e2.styles.calendar, t.dataset.vc = "calendar", t.dataset.vcInput = "", t.dataset.vcCalendarHidden = "", setContext(e2, "inputModeInit", true), setContext(e2, "isShowInInputMode", false), setContext(e2, "mainElement", t), document.body.appendChild(e2.context.mainElement), reset(e2, { year: true, month: true, dates: true, time: true, locale: true }), setTimeout((() => show(e2))), e2.onInit && e2.onInit(e2), handleArrowKeys(e2), handleClick(e2);
      };
      handleInput = (e2) => {
        setContext(e2, "inputElement", e2.context.mainElement);
        const t = () => {
          e2.context.inputModeInit ? setTimeout((() => show(e2))) : createToInput(e2);
        };
        return e2.context.inputElement.addEventListener("click", t), e2.context.inputElement.addEventListener("focus", t), () => {
          e2.context.inputElement.removeEventListener("click", t), e2.context.inputElement.removeEventListener("focus", t);
        };
      };
      init = (e2) => (setContext(e2, "originalElement", e2.context.mainElement.cloneNode(true)), setContext(e2, "isInit", true), e2.inputMode ? handleInput(e2) : (initAllVariables(e2), create(e2), e2.onInit && e2.onInit(e2), handleArrowKeys(e2), handleClick(e2)));
      update = (e2, t) => {
        if (!e2.context.isInit) throw new Error(errorMessages.notInit);
        reset(e2, __spreadValues(__spreadValues({}, { year: true, month: true, dates: true, time: true, locale: true }), t), !(e2.inputMode && !e2.context.inputModeInit)), e2.onUpdate && e2.onUpdate(e2);
      };
      replaceProperties = (e2, t) => {
        const n = Object.keys(t);
        for (let a = 0; a < n.length; a++) {
          const l = n[a];
          "object" != typeof e2[l] || "object" != typeof t[l] || t[l] instanceof Date || Array.isArray(t[l]) ? void 0 !== t[l] && (e2[l] = t[l]) : replaceProperties(e2[l], t[l]);
        }
      };
      set = (e2, t, n) => {
        replaceProperties(e2, t), e2.context.isInit && update(e2, n);
      };
      setPosition = (e2, t, n) => {
        if (!e2) return;
        const a = "auto" === n ? findBestPickerPosition(e2, t) : n, l = { top: -t.offsetHeight, bottom: e2.offsetHeight, left: 0, center: e2.offsetWidth / 2 - t.offsetWidth / 2, right: e2.offsetWidth - t.offsetWidth }, o = Array.isArray(a) ? a[0] : "bottom", s = Array.isArray(a) ? a[1] : a;
        t.dataset.vcPosition = o;
        const { top: i, left: r } = getOffset(e2), c = i + l[o];
        let d = r + l[s];
        const { vw: u } = getViewportDimensions();
        if (d + t.clientWidth > u) {
          const e3 = window.innerWidth - document.body.clientWidth;
          d = u - t.clientWidth - e3;
        } else d < 0 && (d = 0);
        Object.assign(t.style, { left: `${d}px`, top: `${c}px` });
      };
      show = (e2) => {
        if (e2.context.isShowInInputMode) return;
        if (!e2.context.currentType) return void e2.context.mainElement.click();
        setContext(e2, "cleanupHandlers", []), setContext(e2, "isShowInInputMode", true), setPosition(e2.context.inputElement, e2.context.mainElement, e2.positionToInput), e2.context.mainElement.removeAttribute("data-vc-calendar-hidden");
        const t = () => {
          setPosition(e2.context.inputElement, e2.context.mainElement, e2.positionToInput);
        };
        window.addEventListener("resize", t), e2.context.cleanupHandlers.push((() => window.removeEventListener("resize", t)));
        const n = (t2) => {
          "Escape" === t2.key && hide2(e2);
        };
        document.addEventListener("keydown", n), e2.context.cleanupHandlers.push((() => document.removeEventListener("keydown", n)));
        const a = (t2) => {
          t2.target === e2.context.inputElement || e2.context.mainElement.contains(t2.target) || hide2(e2);
        };
        document.addEventListener("click", a, { capture: true }), e2.context.cleanupHandlers.push((() => document.removeEventListener("click", a, { capture: true }))), e2.onShow && e2.onShow(e2);
      };
      labels = { application: "Calendar", navigation: "Calendar Navigation", arrowNext: { month: "Next month", year: "Next list of years" }, arrowPrev: { month: "Previous month", year: "Previous list of years" }, month: "Select month, current selected month:", months: "List of months", year: "Select year, current selected year:", years: "List of years", week: "Days of the week", weekNumber: "Numbers of weeks in a year", dates: "Dates in the current month", selectingTime: "Selecting a time ", inputHour: "Hours", inputMinute: "Minutes", rangeHour: "Slider for selecting hours", rangeMinute: "Slider for selecting minutes", btnKeeping: "Switch AM/PM, current position:" };
      styles = { calendar: "vc", controls: "vc-controls", grid: "vc-grid", column: "vc-column", header: "vc-header", headerContent: "vc-header__content", month: "vc-month", year: "vc-year", arrowPrev: "vc-arrow vc-arrow_prev", arrowNext: "vc-arrow vc-arrow_next", wrapper: "vc-wrapper", content: "vc-content", months: "vc-months", monthsMonth: "vc-months__month", years: "vc-years", yearsYear: "vc-years__year", week: "vc-week", weekDay: "vc-week__day", weekNumbers: "vc-week-numbers", weekNumbersTitle: "vc-week-numbers__title", weekNumbersContent: "vc-week-numbers__content", weekNumber: "vc-week-number", dates: "vc-dates", date: "vc-date", dateBtn: "vc-date__btn", datePopup: "vc-date__popup", dateRangeTooltip: "vc-date-range-tooltip", time: "vc-time", timeContent: "vc-time__content", timeHour: "vc-time__hour", timeMinute: "vc-time__minute", timeKeeping: "vc-time__keeping", timeRanges: "vc-time__ranges", timeRange: "vc-time__range" };
      OptionsCalendar = class {
        constructor() {
          __publicField(this, "type", "default"), __publicField(this, "inputMode", false), __publicField(this, "positionToInput", "left"), __publicField(this, "firstWeekday", 1), __publicField(this, "monthsToSwitch", 1), __publicField(this, "themeAttrDetect", "html[data-theme]"), __publicField(this, "locale", "en"), __publicField(this, "dateToday", "today"), __publicField(this, "dateMin", "1970-01-01"), __publicField(this, "dateMax", "2470-12-31"), __publicField(this, "displayDateMin"), __publicField(this, "displayDateMax"), __publicField(this, "displayDatesOutside", true), __publicField(this, "displayDisabledDates", false), __publicField(this, "displayMonthsCount"), __publicField(this, "disableDates", []), __publicField(this, "disableAllDates", false), __publicField(this, "disableDatesPast", false), __publicField(this, "disableDatesGaps", false), __publicField(this, "disableWeekdays", []), __publicField(this, "disableToday", false), __publicField(this, "enableDates", []), __publicField(this, "enableEdgeDatesOnly", true), __publicField(this, "enableDateToggle", true), __publicField(this, "enableWeekNumbers", false), __publicField(this, "enableMonthChangeOnDayClick", true), __publicField(this, "enableJumpToSelectedDate", false), __publicField(this, "selectionDatesMode", "single"), __publicField(this, "selectionMonthsMode", true), __publicField(this, "selectionYearsMode", true), __publicField(this, "selectionTimeMode", false), __publicField(this, "selectedDates", []), __publicField(this, "selectedMonth"), __publicField(this, "selectedYear"), __publicField(this, "selectedHolidays", []), __publicField(this, "selectedWeekends", [0, 6]), __publicField(this, "selectedTime"), __publicField(this, "selectedTheme", "system"), __publicField(this, "timeMinHour", 0), __publicField(this, "timeMaxHour", 23), __publicField(this, "timeMinMinute", 0), __publicField(this, "timeMaxMinute", 59), __publicField(this, "timeControls", "all"), __publicField(this, "timeStepHour", 1), __publicField(this, "timeStepMinute", 1), __publicField(this, "sanitizerHTML", ((e2) => e2)), __publicField(this, "onClickDate"), __publicField(this, "onClickWeekDay"), __publicField(this, "onClickWeekNumber"), __publicField(this, "onClickTitle"), __publicField(this, "onClickMonth"), __publicField(this, "onClickYear"), __publicField(this, "onClickArrow"), __publicField(this, "onChangeTime"), __publicField(this, "onChangeToInput"), __publicField(this, "onCreateDateRangeTooltip"), __publicField(this, "onCreateDateEls"), __publicField(this, "onCreateMonthEls"), __publicField(this, "onCreateYearEls"), __publicField(this, "onInit"), __publicField(this, "onUpdate"), __publicField(this, "onDestroy"), __publicField(this, "onShow"), __publicField(this, "onHide"), __publicField(this, "popups", {}), __publicField(this, "labels", __spreadValues({}, labels)), __publicField(this, "layouts", { default: "", multiple: "", month: "", year: "" }), __publicField(this, "styles", __spreadValues({}, styles));
        }
      };
      _Calendar = class e extends OptionsCalendar {
        constructor(t, n) {
          var a;
          super(), __publicField(this, "init", (() => init(this))), __publicField(this, "update", ((e2) => update(this, e2))), __publicField(this, "destroy", (() => destroy(this))), __publicField(this, "show", (() => show(this))), __publicField(this, "hide", (() => hide2(this))), __publicField(this, "set", ((e2, t2) => set(this, e2, t2))), __publicField(this, "context"), this.context = __spreadProps(__spreadValues({}, this.context), { locale: { months: { short: [], long: [] }, weekdays: { short: [], long: [] } } }), setContext(this, "mainElement", "string" == typeof t ? null != (a = e.memoizedElements.get(t)) ? a : this.queryAndMemoize(t) : t), n && replaceProperties(this, n);
        }
        queryAndMemoize(t) {
          const n = document.querySelector(t);
          if (!n) throw new Error(errorMessages.notFoundSelector(t));
          return e.memoizedElements.set(t, n), n;
        }
      };
      __publicField(_Calendar, "memoizedElements", /* @__PURE__ */ new Map());
      Calendar = _Calendar;
    }
  });

  // node_modules/preline/src/plugins/datepicker/vanilla-datepicker-pro.ts
  var CustomVanillaCalendar, vanilla_datepicker_pro_default;
  var init_vanilla_datepicker_pro = __esm({
    "node_modules/preline/src/plugins/datepicker/vanilla-datepicker-pro.ts"() {
      init_vanilla_calendar_pro();
      CustomVanillaCalendar = class extends Calendar {
        constructor(selector, options) {
          super(selector, options);
          const parentSet = this.set;
          this.set = (options2, resetOptions) => {
            if (parentSet) parentSet.call(this, options2, resetOptions);
            if (options2.selectedTime && this.onChangeTime) {
              this.onChangeTime(this, null, true);
            }
            if (options2.selectedMonth && this.onClickMonth) {
              this.onClickMonth(this, null);
            }
            if (options2.selectedYear && this.onClickYear) {
              this.onClickYear(this, null);
            }
          };
        }
        static get defaultStyles() {
          return {
            calendar: "vc",
            controls: "vc-controls",
            grid: "vc-grid",
            column: "vc-column",
            header: "vc-header",
            headerContent: "vc-header__content",
            month: "vc-month",
            year: "vc-year",
            arrowPrev: "vc-arrow vc-arrow_prev",
            arrowNext: "vc-arrow vc-arrow_next",
            wrapper: "vc-wrapper",
            content: "vc-content",
            months: "vc-months",
            monthsMonth: "vc-months__month",
            years: "vc-years",
            yearsYear: "vc-years__year",
            week: "vc-week",
            weekDay: "vc-week__day",
            weekNumbers: "vc-week-numbers",
            weekNumbersTitle: "vc-week-numbers__title",
            weekNumbersContent: "vc-week-numbers__content",
            weekNumber: "vc-week-number",
            dates: "vc-dates",
            date: "vc-date",
            dateBtn: "vc-date__btn",
            datePopup: "vc-date__popup",
            dateRangeTooltip: "vc-date-range-tooltip",
            time: "vc-time",
            timeContent: "vc-time__content",
            timeHour: "vc-time__hour",
            timeMinute: "vc-time__minute",
            timeKeeping: "vc-time__keeping",
            timeRanges: "vc-time__ranges",
            timeRange: "vc-time__range"
          };
        }
        logInfo() {
          console.log("This log is from CustomVanillaCalendar!", this);
        }
      };
      vanilla_datepicker_pro_default = CustomVanillaCalendar;
    }
  });

  // node_modules/preline/src/plugins/datepicker/templates.ts
  var templates;
  var init_templates = __esm({
    "node_modules/preline/src/plugins/datepicker/templates.ts"() {
      templates = {
        default: (theme = false) => `<div class="--single-month flex flex-col overflow-hidden">
    <div class="grid grid-cols-5 items-center gap-x-3 mx-1.5 pb-3" data-vc="header">
      <div class="col-span-1">
        <#CustomArrowPrev />
      </div>
      <div class="col-span-3 flex justify-center items-center gap-x-1">
        <#CustomMonth />
        <span class="text-gray-800 ${theme !== "light" ? "dark:text-neutral-200" : ""}">/</span>
        <#CustomYear />
      </div>
      <div class="col-span-1 flex justify-end">
        <#CustomArrowNext />
      </div>
    </div>
    <div data-vc="wrapper">
      <div data-vc="content">
        <#Week />
        <#Dates />
      </div>
    </div>
  </div>`,
        multiple: (theme = false) => `<div class="relative flex flex-col overflow-hidden">
    <div class="absolute top-2 start-2">
      <#CustomArrowPrev />
    </div>
    <div class="absolute top-2 end-2">
      <#CustomArrowNext />
    </div>
    <div class="sm:flex" data-vc="grid">
      <#Multiple>
        <div class="p-3 space-y-0.5 --single-month" data-vc="column">
          <div class="pb-3" data-vc="header">
            <div class="flex justify-center items-center gap-x-1" data-vc-header="content">
              <#CustomMonth />
              <span class="text-gray-800 ${theme !== "light" ? "dark:text-neutral-200" : ""}">/</span>
              <#CustomYear />
            </div>
          </div>
          <div data-vc="wrapper">
            <div data-vc="content">
              <#Week />
              <#Dates />
            </div>
          </div>
        </div>
      <#/Multiple>
    </div>
  </div>`,
        year: (theme = false) => `<div class="relative bg-white ${theme !== "light" ? "dark:bg-neutral-900" : ""}" data-vc="header" role="toolbar">
    <div class="grid grid-cols-5 items-center gap-x-3 mx-1.5 pb-3" data-vc="header">
      <div class="col-span-1">
        <#CustomArrowPrev />
      </div>
      <div class="col-span-3 flex justify-center items-center gap-x-1">
        <#Month />
        <span class="text-gray-800 ${theme !== "light" ? "dark:text-neutral-200" : ""}">/</span>
        <#Year />
      </div>
      <div class="col-span-1 flex justify-end">
        <#CustomArrowNext />
      </div>
    </div>
  </div>
  <div data-vc="wrapper">
    <div data-vc="content">
      <#Years />
    </div>
  </div>`,
        month: (theme = false) => `<div class="pb-3" data-vc="header" role="toolbar">
    <div class="flex justify-center items-center gap-x-1" data-vc-header="content">
      <#Month />
      <span class="text-gray-800 ${theme !== "light" ? "dark:text-neutral-200" : ""}">/</span>
      <#Year />
    </div>
  </div>
  <div data-vc="wrapper">
    <div data-vc="content">
      <#Months />
    </div>
  </div>`,
        // Custom
        years: (options, theme = false) => {
          return `<div class="relative">
      <span class="hidden" data-vc="year"></span>
      <select data-hs-select='{
          "placeholder": "Select year",
          "dropdownScope": "parent",
          "dropdownVerticalFixedPlacement": "bottom",
          "toggleTag": "<button type=\\"button\\"><span data-title></span></button>",
          "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative flex text-nowrap w-full cursor-pointer text-start font-medium text-gray-800 hover:text-gray-600 focus:outline-hidden focus:text-gray-600 before:absolute before:inset-0 before:z-1 ${theme !== "light" ? "dark:text-neutral-200 dark:hover:text-neutral-300 dark:focus:text-neutral-300" : ""}",
          "dropdownClasses": "mt-2 z-50 w-20 max-h-60 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 ${theme !== "light" ? "dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700" : ""}",
          "optionClasses": "p-2 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 ${theme !== "light" ? "dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" : ""}",
          "optionTemplate": "<div class=\\"flex justify-between items-center w-full\\"><span data-title></span><span class=\\"hidden hs-selected:block\\"><svg class=\\"shrink-0 size-3.5 text-gray-800 ${theme !== "light" ? "dark:text-neutral-200" : ""}\\" xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><polyline points=\\"20 6 9 17 4 12\\"/></svg></span></div>"
        }' class="hidden --year --prevent-on-load-init">
        ${options}
      </select>
    </div>`;
        },
        months: (theme = false) => `<div class="relative">
    <span class="hidden" data-vc="month"></span>
    <select data-hs-select='{
        "placeholder": "Select month",
        "dropdownScope": "parent",
        "dropdownVerticalFixedPlacement": "bottom",
        "toggleTag": "<button type=\\"button\\"><span data-title></span></button>",
        "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative flex text-nowrap w-full cursor-pointer text-start font-medium text-gray-800 hover:text-gray-600 focus:outline-hidden focus:text-gray-600 before:absolute before:inset-0 before:z-1 ${theme !== "light" ? "dark:text-neutral-200 dark:hover:text-neutral-300 dark:focus:text-neutral-300" : ""}",
        "dropdownClasses": "mt-2 z-50 w-32 max-h-60 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 ${theme !== "light" ? "dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700" : ""}",
        "optionClasses": "p-2 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg hs-select-disabled:opacity-50 hs-select-disabled:pointer-events-none focus:outline-hidden focus:bg-gray-100 ${theme !== "light" ? "dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" : ""}",
        "optionTemplate": "<div class=\\"flex justify-between items-center w-full\\"><span data-title></span><span class=\\"hidden hs-selected:block\\"><svg class=\\"shrink-0 size-3.5 text-gray-800 ${theme !== "light" ? "dark:text-neutral-200" : ""}\\" xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><polyline points=\\"20 6 9 17 4 12\\"/></svg></span></div>"
      }' class="hidden --month --prevent-on-load-init">
      <option value="0">January</option>
      <option value="1">February</option>
      <option value="2">March</option>
      <option value="3">April</option>
      <option value="4">May</option>
      <option value="5">June</option>
      <option value="6">July</option>
      <option value="7">August</option>
      <option value="8">September</option>
      <option value="9">October</option>
      <option value="10">November</option>
      <option value="11">December</option>
    </select>
  </div>`,
        hours: (theme = false) => `<div class="relative">
    <select class="--hours hidden" data-hs-select='{
      "placeholder": "Select option...",
      "dropdownVerticalFixedPlacement": "top",
      "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-1 px-2 pe-6 flex text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 before:absolute before:inset-0 before:z-1 ${theme !== "light" ? "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" : ""}",
      "dropdownClasses": "mt-2 z-50 w-full min-w-24 max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 ${theme !== "light" ? "dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700" : ""}",
      "optionClasses": "hs-selected:bg-gray-100 ${theme !== "light" ? "dark:hs-selected:bg-neutral-800" : ""} py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 ${theme !== "light" ? "dark:hs-selected:bg-gray-700" : ""} ${theme !== "light" ? "dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" : ""}",
      "optionTemplate": "<div class=\\"flex justify-between items-center w-full\\"><span data-title></span></div>"
    }'>
      <option value="01">01</option>
      <option value="02">02</option>
      <option value="03">03</option>
      <option value="04">04</option>
      <option value="05">05</option>
      <option value="06">06</option>
      <option value="07">07</option>
      <option value="08">08</option>
      <option value="09">09</option>
      <option value="10">10</option>
      <option value="11">11</option>
      <option value="12" selected>12</option>
    </select>
    <div class="absolute top-1/2 end-2 -translate-y-1/2">
      <svg class="shrink-0 size-3 text-gray-500 ${theme !== "light" ? "dark:text-neutral-500" : ""}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
    </div>
  </div>`,
        minutes: (theme = false) => `<div class="relative">
    <select class="--minutes hidden" data-hs-select='{
      "placeholder": "Select option...",
      "dropdownVerticalFixedPlacement": "top",
      "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-1 px-2 pe-6 flex text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 before:absolute before:inset-0 before:z-1 ${theme !== "light" ? "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" : ""}",
      "dropdownClasses": "mt-2 z-50 w-full min-w-24 max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 ${theme !== "light" ? "dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700" : ""}",
      "optionClasses": "hs-selected:bg-gray-100 ${theme !== "light" ? "dark:hs-selected:bg-neutral-800" : ""} py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 ${theme !== "light" ? "dark:hs-selected:bg-gray-700" : ""} ${theme !== "light" ? "dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" : ""}",
      "optionTemplate": "<div class=\\"flex justify-between items-center w-full\\"><span data-title></span></div>"
    }'>
      <option value="00" selected>00</option>
      <option value="01">01</option>
      <option value="02">02</option>
      <option value="03">03</option>
      <option value="04">04</option>
      <option value="05">05</option>
      <option value="06">06</option>
      <option value="07">07</option>
      <option value="08">08</option>
      <option value="09">09</option>
      <option value="10">10</option>
      <option value="11">11</option>
      <option value="12">12</option>
      <option value="13">13</option>
      <option value="14">14</option>
      <option value="15">15</option>
      <option value="16">16</option>
      <option value="17">17</option>
      <option value="18">18</option>
      <option value="19">19</option>
      <option value="20">20</option>
      <option value="21">21</option>
      <option value="22">22</option>
      <option value="23">23</option>
      <option value="24">24</option>
      <option value="25">25</option>
      <option value="26">26</option>
      <option value="27">27</option>
      <option value="28">28</option>
      <option value="29">29</option>
      <option value="30">30</option>
      <option value="31">31</option>
      <option value="32">32</option>
      <option value="33">33</option>
      <option value="34">34</option>
      <option value="35">35</option>
      <option value="36">36</option>
      <option value="37">37</option>
      <option value="38">38</option>
      <option value="39">39</option>
      <option value="40">40</option>
      <option value="41">41</option>
      <option value="42">42</option>
      <option value="43">43</option>
      <option value="44">44</option>
      <option value="45">45</option>
      <option value="46">46</option>
      <option value="47">47</option>
      <option value="48">48</option>
      <option value="49">49</option>
      <option value="50">50</option>
      <option value="51">51</option>
      <option value="52">52</option>
      <option value="53">53</option>
      <option value="54">54</option>
      <option value="55">55</option>
      <option value="56">56</option>
      <option value="57">57</option>
      <option value="58">58</option>
      <option value="59">59</option>
    </select>
    <div class="absolute top-1/2 end-2 -translate-y-1/2">
      <svg class="shrink-0 size-3 text-gray-500 ${theme !== "light" ? "dark:text-neutral-500" : ""}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
    </div>
  </div>`,
        meridiem: (theme = false) => `<div class="relative">
    <select class="--meridiem hidden" data-hs-select='{
      "placeholder": "Select option...",
      "dropdownVerticalFixedPlacement": "top",
      "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-1 px-2 pe-6 flex text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 before:absolute before:inset-0 before:z-1 ${theme !== "light" ? "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" : ""}",
      "dropdownClasses": "mt-2 z-50 w-full min-w-24 max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 ${theme !== "light" ? "dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700" : ""}",
      "optionClasses": "hs-selected:bg-gray-100 ${theme !== "light" ? "dark:hs-selected:bg-neutral-800" : ""} py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 ${theme !== "light" ? "dark:hs-selected:bg-gray-700" : ""} ${theme !== "light" ? "dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" : ""}",
      "optionTemplate": "<div class=\\"flex justify-between items-center w-full\\"><span data-title></span></div>"
    }'>
      <option value="PM" selected>PM</option>
      <option value="AM">AM</option>
    </select>
    <div class="absolute top-1/2 end-2 -translate-y-1/2">
      <svg class="shrink-0 size-3 text-gray-500 ${theme !== "light" ? "dark:text-neutral-500" : ""}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
    </div>
  </div>`
      };
    }
  });

  // node_modules/preline/src/plugins/datepicker/locale.ts
  var todayTranslations;
  var init_locale = __esm({
    "node_modules/preline/src/plugins/datepicker/locale.ts"() {
      todayTranslations = {
        "ru-RU": "\u0441\u0435\u0433\u043E\u0434\u043D\u044F",
        "ru": "\u0441\u0435\u0433\u043E\u0434\u043D\u044F",
        "de-DE": "Heute",
        "de": "Heute",
        "fr-FR": "Aujourd'hui",
        "fr": "Aujourd'hui",
        "es-ES": "Hoy",
        "es": "Hoy",
        "it-IT": "Oggi",
        "it": "Oggi",
        "pt-BR": "Hoje",
        "pt": "Hoje",
        "pl-PL": "Dzisiaj",
        "pl": "Dzisiaj",
        "uk-UA": "\u0421\u044C\u043E\u0433\u043E\u0434\u043D\u0456",
        "uk": "\u0421\u044C\u043E\u0433\u043E\u0434\u043D\u0456",
        "zh-CN": "\u4ECA\u5929",
        "zh": "\u4ECA\u5929",
        "ja-JP": "\u4ECA\u65E5",
        "ja": "\u4ECA\u65E5",
        "ko-KR": "\uC624\uB298",
        "ko": "\uC624\uB298",
        "ar-SA": "\u0627\u0644\u064A\u0648\u0645",
        "ar": "\u0627\u0644\u064A\u0648\u0645",
        "hi-IN": "\u0906\u091C",
        "hi": "\u0906\u091C",
        "tr-TR": "Bug\xFCn",
        "tr": "Bug\xFCn",
        "nl-NL": "Vandaag",
        "nl": "Vandaag",
        "sv-SE": "Idag",
        "sv": "Idag",
        "da-DK": "I dag",
        "da": "I dag",
        "no-NO": "I dag",
        "no": "I dag",
        "fi-FI": "T\xE4n\xE4\xE4n",
        "fi": "T\xE4n\xE4\xE4n",
        "cs-CZ": "Dnes",
        "cs": "Dnes",
        "sk-SK": "Dnes",
        "sk": "Dnes",
        "hu-HU": "Ma",
        "hu": "Ma",
        "ro-RO": "Ast\u0103zi",
        "ro": "Ast\u0103zi",
        "bg-BG": "\u0414\u043D\u0435\u0441",
        "bg": "\u0414\u043D\u0435\u0441",
        "hr-HR": "Danas",
        "hr": "Danas",
        "sr-RS": "\u0414\u0430\u043D\u0430\u0441",
        "sr": "\u0414\u0430\u043D\u0430\u0441",
        "sl-SI": "Danes",
        "sl": "Danes",
        "et-EE": "T\xE4na",
        "et": "T\xE4na",
        "lv-LV": "\u0160odien",
        "lv": "\u0160odien",
        "lt-LT": "\u0160iandien",
        "lt": "\u0160iandien",
        "el-GR": "\u03A3\u03AE\u03BC\u03B5\u03C1\u03B1",
        "el": "\u03A3\u03AE\u03BC\u03B5\u03C1\u03B1",
        "he-IL": "\u05D4\u05D9\u05D5\u05DD",
        "he": "\u05D4\u05D9\u05D5\u05DD",
        "th-TH": "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49",
        "th": "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49",
        "vi-VN": "H\xF4m nay",
        "vi": "H\xF4m nay",
        "id-ID": "Hari ini",
        "id": "Hari ini",
        "ms-MY": "Hari ini",
        "ms": "Hari ini",
        "fa-IR": "\u0627\u0645\u0631\u0648\u0632",
        "fa": "\u0627\u0645\u0631\u0648\u0632",
        "ur-PK": "\u0622\u062C",
        "ur": "\u0622\u062C",
        "bn-BD": "\u0986\u099C",
        "bn": "\u0986\u099C",
        "ta-IN": "\u0B87\u0BA9\u0BCD\u0BB1\u0BC1",
        "ta": "\u0B87\u0BA9\u0BCD\u0BB1\u0BC1",
        "te-IN": "\u0C28\u0C47\u0C21\u0C41",
        "te": "\u0C28\u0C47\u0C21\u0C41",
        "ml-IN": "\u0D07\u0D28\u0D4D\u0D28\u0D4D",
        "ml": "\u0D07\u0D28\u0D4D\u0D28\u0D4D",
        "kn-IN": "\u0C87\u0C82\u0CA6\u0CC1",
        "kn": "\u0C87\u0C82\u0CA6\u0CC1",
        "gu-IN": "\u0A86\u0A9C\u0AC7",
        "gu": "\u0A86\u0A9C\u0AC7",
        "pa-IN": "\u0A05\u0A71\u0A1C",
        "pa": "\u0A05\u0A71\u0A1C",
        "or-IN": "\u0B06\u0B1C\u0B3F",
        "or": "\u0B06\u0B1C\u0B3F",
        "as-IN": "\u0986\u099C\u09BF",
        "as": "\u0986\u099C\u09BF",
        "ne-NP": "\u0906\u091C",
        "ne": "\u0906\u091C",
        "si-LK": "\u0D85\u0DAF",
        "si": "\u0D85\u0DAF",
        "my-MM": "\u101A\u1014\u1031\u1037",
        "my": "\u101A\u1014\u1031\u1037",
        "km-KH": "\u1790\u17D2\u1784\u17C3\u1793\u17C1\u17C7",
        "km": "\u1790\u17D2\u1784\u17C3\u1793\u17C1\u17C7",
        "lo-LA": "\u0EA1\u0EB7\u0EC9\u0E99\u0EB5\u0EC9",
        "lo": "\u0EA1\u0EB7\u0EC9\u0E99\u0EB5\u0EC9",
        "mn-MN": "\u04E8\u043D\u04E9\u04E9\u0434\u04E9\u0440",
        "mn": "\u04E8\u043D\u04E9\u04E9\u0434\u04E9\u0440",
        "ka-GE": "\u10D3\u10E6\u10D4\u10E1",
        "ka": "\u10D3\u10E6\u10D4\u10E1",
        "hy-AM": "\u0531\u0575\u057D\u0585\u0580",
        "hy": "\u0531\u0575\u057D\u0585\u0580",
        "az-AZ": "Bu g\xFCn",
        "az": "Bu g\xFCn",
        "kk-KZ": "\u0411\u04AF\u0433\u0456\u043D",
        "kk": "\u0411\u04AF\u0433\u0456\u043D",
        "ky-KG": "\u0411\u04AF\u0433\u04AF\u043D",
        "ky": "\u0411\u04AF\u0433\u04AF\u043D",
        "uz-UZ": "Bugun",
        "uz": "Bugun",
        "tg-TJ": "\u0418\u043C\u0440\u04EF\u0437",
        "tg": "\u0418\u043C\u0440\u04EF\u0437",
        "ps-AF": "\u0646\u0646",
        "ps": "\u0646\u0646",
        "ku-IQ": "\u0626\u06D5\u0645\u0695\u06C6",
        "ku": "\u0626\u06D5\u0645\u0695\u06C6",
        "yi-IL": "\u05D4\u05D9\u05D9\u05E0\u05D8",
        "yi": "\u05D4\u05D9\u05D9\u05E0\u05D8",
        "lb-LU": "Haut",
        "lb": "Haut",
        "is-IS": "\xCD dag",
        "is": "\xCD dag",
        "mt-MT": "Illum",
        "mt": "Illum",
        "cy-GB": "Heddiw",
        "cy": "Heddiw",
        "ga-IE": "Inniu",
        "ga": "Inniu",
        "gd-GB": "An-diugh",
        "gd": "An-diugh",
        "kw-GB": "Hedhyw",
        "kw": "Hedhyw",
        "br-FR": "Hiziv",
        "br": "Hiziv",
        "oc-FR": "U\xE8i",
        "oc": "U\xE8i",
        "ca-ES": "Avui",
        "ca": "Avui",
        "eu-ES": "Gaur",
        "eu": "Gaur",
        "gl-ES": "Hoxe",
        "gl": "Hoxe",
        "ast-ES": "G\xFCei",
        "ast": "G\xFCei",
        "an-ES": "Hue",
        "an": "Hue",
        "fur-IT": "Vu\xEA",
        "fur": "Vu\xEA",
        "lij-IT": "Ancheu",
        "lij": "Ancheu",
        "pms-IT": "Ancheuj",
        "pms": "Ancheuj",
        "rm-CH": "Oz",
        "rm": "Oz",
        "gsw-CH": "H\xFCt",
        "gsw": "H\xFCt",
        "wae-CH": "H\xFCt",
        "wae": "H\xFCt",
        "bar-AT": "Heit",
        "bar": "Heit",
        "ksh-DE": "H\xFCck",
        "ksh": "H\xFCck",
        "nds-DE": "Vundaag",
        "nds": "Vundaag",
        "pfl-DE": "Haid",
        "pfl": "Haid",
        "pdc-US": "Heit",
        "pdc": "Heit",
        "af-ZA": "Vandag",
        "af": "Vandag",
        "zu-ZA": "Namhlanje",
        "zu": "Namhlanje",
        "xh-ZA": "Namhlanje",
        "xh": "Namhlanje",
        "st-ZA": "Kajeno",
        "st": "Kajeno",
        "tn-ZA": "Kajeno",
        "tn": "Kajeno",
        "ve-ZA": "Leno",
        "ve": "Leno",
        "nso-ZA": "Kajeno",
        "nso": "Kajeno",
        "ts-ZA": "Namuntlha",
        "ts": "Namuntlha",
        "ss-ZA": "Lamuhla",
        "ss": "Lamuhla",
        "nr-ZA": "Namhlanje",
        "nr": "Namhlanje",
        "ff-SN": "Hannde",
        "ff": "Hannde",
        "wo-SN": "Tey",
        "wo": "Tey",
        "ig-NG": "Taa",
        "ig": "Taa",
        "yo-NG": "L\xF3n\xEC\xED",
        "yo": "L\xF3n\xEC\xED",
        "ha-NG": "Yau",
        "ha": "Yau",
        "sw-KE": "Leo",
        "sw": "Leo",
        "am-ET": "\u12DB\u122C",
        "am": "\u12DB\u122C",
        "ti-ER": "\u120E\u121A",
        "ti": "\u120E\u121A",
        "so-SO": "Maanta",
        "so": "Maanta",
        "om-ET": "Har'a",
        "om": "Har'a"
      };
    }
  });

  // node_modules/preline/src/plugins/datepicker/index.ts
  var datepicker_exports = {};
  __export(datepicker_exports, {
    default: () => datepicker_default
  });
  var HSDatepicker, datepicker_default;
  var init_datepicker = __esm({
    "node_modules/preline/src/plugins/datepicker/index.ts"() {
      init_utils();
      init_vanilla_datepicker_pro();
      init_templates();
      init_locale();
      init_utils();
      init_select();
      init_base_plugin();
      HSDatepicker = class _HSDatepicker extends HSBasePlugin {
        dataOptions;
        concatOptions;
        updatedStyles;
        vanillaCalendar;
        constructor(el, options, events) {
          super(el, options, events);
          const dataOptions = el.getAttribute("data-hs-datepicker") ? JSON.parse(el.getAttribute("data-hs-datepicker")) : {};
          this.dataOptions = {
            ...dataOptions,
            ...options
          };
          const removeDefaultStyles = typeof this.dataOptions?.removeDefaultStyles !== "undefined" ? this.dataOptions?.removeDefaultStyles : false;
          this.updatedStyles = _.mergeWith(
            removeDefaultStyles ? {} : vanilla_datepicker_pro_default.defaultStyles,
            this.dataOptions?.styles || {},
            (a, b) => {
              if (typeof a === "string" && typeof b === "string") {
                return `${a} ${b}`;
              }
            }
          );
          const today = /* @__PURE__ */ new Date();
          const defaults2 = {
            selectedTheme: this.dataOptions.selectedTheme ?? "",
            styles: this.updatedStyles,
            dateMin: this.dataOptions.dateMin ?? today.toISOString().split("T")[0],
            dateMax: this.dataOptions.dateMax ?? "2470-12-31",
            mode: this.dataOptions.mode ?? "default",
            inputMode: typeof this.dataOptions.inputMode !== "undefined" ? this.dataOptions.inputMode : true
          };
          const chainCallbacks = (superCallback, customCallback) => (self2) => {
            superCallback?.(self2);
            customCallback?.(self2);
          };
          const initTime2 = (self2) => {
            if (this.hasTime(self2)) this.initCustomTime(self2);
          };
          const _options = {
            layouts: {
              month: templates.month(defaults2.selectedTheme)
            },
            onInit: chainCallbacks(this.dataOptions.onInit, (self2) => {
              if (defaults2.mode === "custom-select" && !this.dataOptions.inputMode) {
                initTime2(self2);
              }
            }),
            onShow: chainCallbacks(this.dataOptions.onShow, (self2) => {
              if (defaults2.mode === "custom-select") {
                this.updateCustomSelects(self2);
                initTime2(self2);
              }
            }),
            onHide: chainCallbacks(this.dataOptions.onHide, (self2) => {
              if (defaults2.mode === "custom-select") {
                this.destroySelects(self2.context.mainElement);
              }
            }),
            onUpdate: chainCallbacks(this.dataOptions.onUpdate, (self2) => {
              this.updateCalendar(self2.context.mainElement);
            }),
            onCreateDateEls: chainCallbacks(
              this.dataOptions.onCreateDateEls,
              (self2) => {
                if (defaults2.mode === "custom-select") this.updateCustomSelects(self2);
              }
            ),
            onChangeToInput: chainCallbacks(
              this.dataOptions.onChangeToInput,
              (self2) => {
                if (!self2.context.inputElement) return;
                this.setInputValue(
                  self2.context.inputElement,
                  self2.context.selectedDates
                );
                const data = {
                  selectedDates: self2.context.selectedDates,
                  selectedTime: self2.context.selectedTime,
                  rest: self2.context
                };
                this.fireEvent("change", data);
                dispatch("change.hs.datepicker", this.el, data);
              }
            ),
            onChangeTime: chainCallbacks(this.dataOptions.onChangeTime, initTime2),
            onClickYear: chainCallbacks(this.dataOptions.onClickYear, initTime2),
            onClickMonth: chainCallbacks(this.dataOptions.onClickMonth, initTime2),
            onClickArrow: chainCallbacks(this.dataOptions.onClickArrow, (self2) => {
              if (defaults2.mode === "custom-select") {
                setTimeout(() => {
                  this.disableNav();
                  this.disableOptions();
                  this.updateCalendar(self2.context.mainElement);
                });
              }
            })
          };
          this.concatOptions = _.merge(_options, this.dataOptions);
          const processedOptions = {
            ...defaults2,
            layouts: {
              default: this.processCustomTemplate(
                templates.default(defaults2.selectedTheme),
                "default"
              ),
              multiple: this.processCustomTemplate(
                templates.multiple(defaults2.selectedTheme),
                "multiple"
              ),
              year: this.processCustomTemplate(
                templates.year(defaults2.selectedTheme),
                "default"
              )
            }
          };
          this.concatOptions = _.merge(this.concatOptions, processedOptions);
          this.vanillaCalendar = new vanilla_datepicker_pro_default(
            this.el,
            this.concatOptions
          );
          this.init();
        }
        init() {
          this.createCollection(window.$hsDatepickerCollection, this);
          this.vanillaCalendar.init();
          if (this.dataOptions?.selectedDates) {
            this.setInputValue(
              this.vanillaCalendar.context.inputElement,
              this.formatDateArrayToIndividualDates(this.dataOptions?.selectedDates)
            );
          }
        }
        getTimeParts(time) {
          const [_time, meridiem] = time.split(" ");
          const [hours, minutes] = _time.split(":");
          return [hours, minutes, meridiem];
        }
        getCurrentMonthAndYear(el) {
          const currentMonthHolder = el.querySelector('[data-vc="month"]');
          const currentYearHolder = el.querySelector('[data-vc="year"]');
          return {
            month: +currentMonthHolder.getAttribute("data-vc-month"),
            year: +currentYearHolder.getAttribute("data-vc-year")
          };
        }
        setInputValue(target, dates) {
          const dateFormat = this.dataOptions?.dateFormat;
          const dateSeparator = this.dataOptions?.inputModeOptions?.dateSeparator ?? ".";
          const itemsSeparator = this.dataOptions?.inputModeOptions?.itemsSeparator ?? ", ";
          const selectionDatesMode = this.dataOptions?.selectionDatesMode ?? "single";
          if (dates.length && dates.length > 1) {
            if (selectionDatesMode === "multiple") {
              const temp = [];
              dates.forEach(
                (date) => temp.push(
                  dateFormat ? this.formatDate(date, dateFormat) : this.changeDateSeparator(date, dateSeparator)
                )
              );
              target.value = temp.join(itemsSeparator);
            } else {
              const formattedStart = dateFormat ? this.formatDate(dates[0], dateFormat) : this.changeDateSeparator(dates[0], dateSeparator);
              const formattedEnd = dateFormat ? this.formatDate(dates[1], dateFormat) : this.changeDateSeparator(dates[1], dateSeparator);
              target.value = [formattedStart, formattedEnd].join(itemsSeparator);
            }
          } else if (dates.length && dates.length === 1) {
            target.value = dateFormat ? this.formatDate(dates[0], dateFormat) : this.changeDateSeparator(dates[0], dateSeparator);
          } else target.value = "";
        }
        getLocalizedTodayText(locale) {
          return todayTranslations[locale] || "Today";
        }
        changeDateSeparator(date, separator = ".", defaultSeparator = "-") {
          const dateObj = new Date(date);
          if (this.dataOptions?.replaceTodayWithText) {
            const today = /* @__PURE__ */ new Date();
            const isToday = dateObj.toDateString() === today.toDateString();
            if (isToday) {
              const dateLocale = this.dataOptions?.dateLocale;
              return this.getLocalizedTodayText(dateLocale);
            }
          }
          const newDate = date.split(defaultSeparator);
          return newDate.join(separator);
        }
        formatDateArrayToIndividualDates(dates) {
          const selectionDatesMode = this.dataOptions?.selectionDatesMode ?? "single";
          const expandDateRange = (start, end) => {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const result = [];
            while (startDate <= endDate) {
              result.push(startDate.toISOString().split("T")[0]);
              startDate.setDate(startDate.getDate() + 1);
            }
            return result;
          };
          const formatDate = (date) => {
            if (typeof date === "string") {
              if (date.toLowerCase() === "today") {
                const today = /* @__PURE__ */ new Date();
                return [today.toISOString().split("T")[0]];
              }
              const rangeMatch = date.match(
                /^(\d{4}-\d{2}-\d{2})\s*[^a-zA-Z0-9]*\s*(\d{4}-\d{2}-\d{2})$/
              );
              if (rangeMatch) {
                const [_2, start, end] = rangeMatch;
                return selectionDatesMode === "multiple-ranged" ? [start, end] : expandDateRange(start.trim(), end.trim());
              }
              return [date];
            } else if (typeof date === "number") {
              return [new Date(date).toISOString().split("T")[0]];
            } else if (date instanceof Date) {
              return [date.toISOString().split("T")[0]];
            }
            return [];
          };
          return dates.flatMap(formatDate);
        }
        hasTime(el) {
          const { mainElement } = el.context;
          const hours = mainElement.querySelector(
            "[data-hs-select].--hours"
          );
          const minutes = mainElement.querySelector(
            "[data-hs-select].--minutes"
          );
          const meridiem = mainElement.querySelector(
            "[data-hs-select].--meridiem"
          );
          return hours && minutes && meridiem;
        }
        createArrowFromTemplate(template, classes = false) {
          if (!classes) return template;
          const temp = htmlToElement(template);
          classToClassList(classes, temp);
          return temp.outerHTML;
        }
        concatObjectProperties(shared, other) {
          const result = {};
          const allKeys = /* @__PURE__ */ new Set([
            ...Object.keys(shared || {}),
            ...Object.keys(other || {})
          ]);
          allKeys.forEach((key) => {
            const sharedValue = shared[key] || "";
            const otherValue = other[key] || "";
            result[key] = `${sharedValue} ${otherValue}`.trim();
          });
          return result;
        }
        updateTemplate(template, shared, specific) {
          if (!shared) return template;
          const defaultOptions = JSON.parse(
            template.match(/data-hs-select='([^']+)'/)[1]
          );
          const concatOptions = this.concatObjectProperties(shared, specific);
          const mergedOptions = _.merge(defaultOptions, concatOptions);
          const updatedTemplate = template.replace(
            /data-hs-select='[^']+'/,
            `data-hs-select='${JSON.stringify(mergedOptions)}'`
          );
          return updatedTemplate;
        }
        initCustomTime(self2) {
          const { mainElement } = self2.context;
          const timeParts = this.getTimeParts(self2.selectedTime ?? "12:00 PM");
          const selectors = {
            hours: mainElement.querySelector(
              "[data-hs-select].--hours"
            ),
            minutes: mainElement.querySelector(
              "[data-hs-select].--minutes"
            ),
            meridiem: mainElement.querySelector(
              "[data-hs-select].--meridiem"
            )
          };
          Object.entries(selectors).forEach(([key, element]) => {
            if (!select_default.getInstance(element, true)) {
              const instance = new select_default(element);
              instance.setValue(
                timeParts[key === "meridiem" ? 2 : key === "minutes" ? 1 : 0]
              );
              instance.el.addEventListener("change.hs.select", (evt) => {
                this.destroySelects(mainElement);
                const updatedTime = {
                  hours: key === "hours" ? evt.detail.payload : timeParts[0],
                  minutes: key === "minutes" ? evt.detail.payload : timeParts[1],
                  meridiem: key === "meridiem" ? evt.detail.payload : timeParts[2]
                };
                self2.set({
                  selectedTime: `${updatedTime.hours}:${updatedTime.minutes} ${updatedTime.meridiem}`
                }, {
                  dates: false,
                  year: false,
                  month: false
                });
              });
            }
          });
        }
        initCustomMonths(self2) {
          const { mainElement } = self2.context;
          const columns = Array.from(mainElement.querySelectorAll(".--single-month"));
          if (columns.length) {
            columns.forEach((column, idx) => {
              const _month = column.querySelector(
                "[data-hs-select].--month"
              );
              const isInstanceExists = select_default.getInstance(_month, true);
              if (isInstanceExists) return false;
              const instance = new select_default(_month);
              const { month, year } = this.getCurrentMonthAndYear(column);
              instance.setValue(`${month}`);
              instance.el.addEventListener("change.hs.select", (evt) => {
                this.destroySelects(mainElement);
                self2.set({
                  selectedMonth: +evt.detail.payload - idx < 0 ? 11 : +evt.detail.payload - idx,
                  selectedYear: +evt.detail.payload - idx < 0 ? +year - 1 : year
                }, {
                  dates: false,
                  time: false
                });
              });
            });
          }
        }
        initCustomYears(self2) {
          const { mainElement } = self2.context;
          const columns = Array.from(mainElement.querySelectorAll(".--single-month"));
          if (columns.length) {
            columns.forEach((column) => {
              const _year = column.querySelector(
                "[data-hs-select].--year"
              );
              const isInstanceExists = select_default.getInstance(_year, true);
              if (isInstanceExists) return false;
              const instance = new select_default(_year);
              const { month, year } = this.getCurrentMonthAndYear(column);
              instance.setValue(`${year}`);
              instance.el.addEventListener("change.hs.select", (evt) => {
                const { dateMax, displayMonthsCount } = this.vanillaCalendar.context;
                const maxYear = new Date(dateMax).getFullYear();
                const maxMonth = new Date(dateMax).getMonth();
                this.destroySelects(mainElement);
                self2.set({
                  selectedMonth: month > maxMonth - displayMonthsCount && +evt.detail.payload === maxYear ? maxMonth - displayMonthsCount + 1 : month,
                  selectedYear: evt.detail.payload
                }, {
                  dates: false,
                  time: false
                });
              });
            });
          }
        }
        generateCustomTimeMarkup() {
          const customSelectOptions = this.updatedStyles?.customSelect;
          const hours = customSelectOptions ? this.updateTemplate(
            templates.hours(this.concatOptions.selectedTheme),
            customSelectOptions?.shared || {},
            customSelectOptions?.hours || {}
          ) : templates.hours(this.concatOptions.selectedTheme);
          const minutes = customSelectOptions ? this.updateTemplate(
            templates.minutes(this.concatOptions.selectedTheme),
            customSelectOptions?.shared || {},
            customSelectOptions?.minutes || {}
          ) : templates.minutes(this.concatOptions.selectedTheme);
          const meridiem = customSelectOptions ? this.updateTemplate(
            templates.meridiem(this.concatOptions.selectedTheme),
            customSelectOptions?.shared || {},
            customSelectOptions?.meridiem || {}
          ) : templates.meridiem(this.concatOptions.selectedTheme);
          const time = this?.dataOptions?.templates?.time ?? `
			<div class="pt-3 flex justify-center items-center gap-x-2">
        ${hours}
        <span class="text-gray-800 ${this.concatOptions.selectedTheme !== "light" ? "dark:text-white" : ""}">:</span>
        ${minutes}
        ${meridiem}
      </div>
		`;
          return `<div class="--time">${time}</div>`;
        }
        generateCustomMonthMarkup() {
          const mode = this?.dataOptions?.mode ?? "default";
          const customSelectOptions = this.updatedStyles?.customSelect;
          const updatedTemplate = customSelectOptions ? this.updateTemplate(
            templates.months(this.concatOptions.selectedTheme),
            customSelectOptions?.shared || {},
            customSelectOptions?.months || {}
          ) : templates.months(this.concatOptions.selectedTheme);
          const month = mode === "custom-select" ? updatedTemplate : "<#Month />";
          return month;
        }
        generateCustomYearMarkup() {
          const mode = this?.dataOptions?.mode ?? "default";
          if (mode === "custom-select") {
            const today = /* @__PURE__ */ new Date();
            const dateMin = this?.dataOptions?.dateMin ?? today.toISOString().split("T")[0];
            const tempDateMax = this?.dataOptions?.dateMax ?? "2470-12-31";
            const dateMax = tempDateMax;
            const startDate = new Date(dateMin);
            const endDate = new Date(dateMax);
            const startDateYear = startDate.getFullYear();
            const endDateYear = endDate.getFullYear();
            const generateOptions = () => {
              let result = "";
              for (let i = startDateYear; i <= endDateYear; i++) {
                result += `<option value="${i}">${i}</option>`;
              }
              return result;
            };
            const years = templates.years(
              generateOptions(),
              this.concatOptions.selectedTheme
            );
            const customSelectOptions = this.updatedStyles?.customSelect;
            const updatedTemplate = customSelectOptions ? this.updateTemplate(
              years,
              customSelectOptions?.shared || {},
              customSelectOptions?.years || {}
            ) : years;
            return updatedTemplate;
          } else {
            return "<#Year />";
          }
        }
        generateCustomArrowPrevMarkup() {
          const arrowPrev = this?.dataOptions?.templates?.arrowPrev ? this.createArrowFromTemplate(
            this.dataOptions.templates.arrowPrev,
            this.updatedStyles.arrowPrev
          ) : "<#ArrowPrev [month] />";
          return arrowPrev;
        }
        generateCustomArrowNextMarkup() {
          const arrowNext = this?.dataOptions?.templates?.arrowNext ? this.createArrowFromTemplate(
            this.dataOptions.templates.arrowNext,
            this.updatedStyles.arrowNext
          ) : "<#ArrowNext [month] />";
          return arrowNext;
        }
        parseCustomTime(template) {
          template = template.replace(
            /<#CustomTime\s*\/>/g,
            this.generateCustomTimeMarkup()
          );
          return template;
        }
        parseCustomMonth(template) {
          template = template.replace(
            /<#CustomMonth\s*\/>/g,
            this.generateCustomMonthMarkup()
          );
          return template;
        }
        parseCustomYear(template) {
          template = template.replace(
            /<#CustomYear\s*\/>/g,
            this.generateCustomYearMarkup()
          );
          return template;
        }
        parseArrowPrev(template) {
          template = template.replace(
            /<#CustomArrowPrev\s*\/>/g,
            this.generateCustomArrowPrevMarkup()
          );
          return template;
        }
        parseArrowNext(template) {
          template = template.replace(
            /<#CustomArrowNext\s*\/>/g,
            this.generateCustomArrowNextMarkup()
          );
          return template;
        }
        processCustomTemplate(template, type) {
          const templateAccordingToType = type === "default" ? this?.dataOptions?.layouts?.default : this?.dataOptions?.layouts?.multiple;
          const processedCustomMonth = this.parseCustomMonth(
            templateAccordingToType ?? template
          );
          const processedCustomYear = this.parseCustomYear(processedCustomMonth);
          const processedCustomTime = this.parseCustomTime(processedCustomYear);
          const processedCustomArrowPrev = this.parseArrowPrev(processedCustomTime);
          const processedCustomTemplate = this.parseArrowNext(
            processedCustomArrowPrev
          );
          return processedCustomTemplate;
        }
        disableOptions() {
          const { mainElement, dateMax, displayMonthsCount } = this.vanillaCalendar.context;
          const maxDate = new Date(dateMax);
          const columns = Array.from(mainElement.querySelectorAll(".--single-month"));
          columns.forEach((column, idx) => {
            const year = +column.querySelector('[data-vc="year"]')?.getAttribute(
              "data-vc-year"
            );
            const monthOptions = column.querySelectorAll(
              "[data-hs-select].--month option"
            );
            const pseudoOptions = column.querySelectorAll(
              "[data-hs-select-dropdown] [data-value]"
            );
            const isDisabled = (option) => {
              const value = +option.getAttribute("data-value");
              return value > maxDate.getMonth() - displayMonthsCount + idx + 1 && year === maxDate.getFullYear();
            };
            Array.from(monthOptions).forEach(
              (option) => option.toggleAttribute("disabled", isDisabled(option))
            );
            Array.from(pseudoOptions).forEach(
              (option) => option.classList.toggle("disabled", isDisabled(option))
            );
          });
        }
        disableNav() {
          const {
            mainElement,
            dateMax,
            selectedYear,
            selectedMonth,
            displayMonthsCount
          } = this.vanillaCalendar.context;
          const maxYear = new Date(dateMax).getFullYear();
          const next = mainElement.querySelector(
            '[data-vc-arrow="next"]'
          );
          if (selectedYear === maxYear && selectedMonth + displayMonthsCount > 11) {
            next.style.visibility = "hidden";
          } else next.style.visibility = "";
        }
        destroySelects(container) {
          const selects = Array.from(container.querySelectorAll("[data-hs-select]"));
          selects.forEach((select) => {
            const instance = select_default.getInstance(select, true);
            if (instance) instance.element.destroy();
          });
        }
        updateSelect(el, value) {
          const instance = select_default.getInstance(el, true);
          if (instance) instance.element.setValue(value);
        }
        updateCalendar(calendar) {
          const columns = calendar.querySelectorAll(".--single-month");
          if (columns.length) {
            columns.forEach((column) => {
              const { month, year } = this.getCurrentMonthAndYear(column);
              this.updateSelect(
                column.querySelector("[data-hs-select].--month"),
                `${month}`
              );
              this.updateSelect(
                column.querySelector("[data-hs-select].--year"),
                `${year}`
              );
            });
          }
        }
        updateCustomSelects(el) {
          setTimeout(() => {
            this.disableOptions();
            this.disableNav();
            this.initCustomMonths(el);
            this.initCustomYears(el);
          });
        }
        // Public methods
        getCurrentState() {
          return {
            selectedDates: this.vanillaCalendar.selectedDates,
            selectedTime: this.vanillaCalendar.selectedTime
          };
        }
        formatDate(date, format) {
          const dateFormat = format || this.dataOptions?.dateFormat;
          const dateLocale = this.dataOptions?.dateLocale || void 0;
          if (!dateFormat) {
            const dateSeparator = this.dataOptions?.inputModeOptions?.dateSeparator ?? ".";
            return this.changeDateSeparator(date, dateSeparator);
          }
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) {
            return this.changeDateSeparator(date);
          }
          let result = "";
          let i = 0;
          while (i < dateFormat.length) {
            if (dateFormat.slice(i, i + 4) === "YYYY") {
              result += dateObj.getFullYear().toString();
              i += 4;
            } else if (dateFormat.slice(i, i + 4) === "dddd") {
              const dayName = dateObj.toLocaleDateString(dateLocale, {
                weekday: "long"
              });
              if (this.dataOptions?.replaceTodayWithText) {
                const today = /* @__PURE__ */ new Date();
                const isToday = dateObj.toDateString() === today.toDateString();
                if (isToday) {
                  result += this.getLocalizedTodayText(dateLocale);
                } else {
                  result += dayName;
                }
              } else {
                result += dayName;
              }
              i += 4;
            } else if (dateFormat.slice(i, i + 4) === "MMMM") {
              result += dateObj.toLocaleDateString(dateLocale, { month: "long" });
              i += 4;
            } else if (dateFormat.slice(i, i + 3) === "ddd") {
              const dayName = dateObj.toLocaleDateString(dateLocale, {
                weekday: "short"
              });
              if (this.dataOptions?.replaceTodayWithText) {
                const today = /* @__PURE__ */ new Date();
                const isToday = dateObj.toDateString() === today.toDateString();
                if (isToday) {
                  result += this.getLocalizedTodayText(dateLocale);
                } else {
                  result += dayName;
                }
              } else {
                result += dayName;
              }
              i += 3;
            } else if (dateFormat.slice(i, i + 3) === "MMM") {
              result += dateObj.toLocaleDateString(dateLocale, { month: "short" });
              i += 3;
            } else if (dateFormat.slice(i, i + 2) === "YY") {
              result += dateObj.getFullYear().toString().slice(-2);
              i += 2;
            } else if (dateFormat.slice(i, i + 2) === "MM") {
              result += String(dateObj.getMonth() + 1).padStart(2, "0");
              i += 2;
            } else if (dateFormat.slice(i, i + 2) === "DD") {
              result += String(dateObj.getDate()).padStart(2, "0");
              i += 2;
            } else if (dateFormat.slice(i, i + 2) === "HH") {
              result += String(dateObj.getHours()).padStart(2, "0");
              i += 2;
            } else if (dateFormat.slice(i, i + 2) === "mm") {
              result += String(dateObj.getMinutes()).padStart(2, "0");
              i += 2;
            } else if (dateFormat.slice(i, i + 2) === "ss") {
              result += String(dateObj.getSeconds()).padStart(2, "0");
              i += 2;
            } else if (dateFormat[i] === "Y") {
              result += dateObj.getFullYear().toString();
              i += 1;
            } else if (dateFormat[i] === "M") {
              result += String(dateObj.getMonth() + 1);
              i += 1;
            } else if (dateFormat[i] === "D") {
              result += String(dateObj.getDate());
              i += 1;
            } else if (dateFormat[i] === "H") {
              result += String(dateObj.getHours());
              i += 1;
            } else if (dateFormat[i] === "m") {
              result += String(dateObj.getMinutes());
              i += 1;
            } else if (dateFormat[i] === "s") {
              result += String(dateObj.getSeconds());
              i += 1;
            } else {
              result += dateFormat[i];
              i += 1;
            }
          }
          return result;
        }
        destroy() {
          if (this.vanillaCalendar) {
            this.vanillaCalendar.destroy();
            this.vanillaCalendar = null;
          }
          window.$hsDatepickerCollection = window.$hsDatepickerCollection.filter(
            ({ element }) => element.el !== this.el
          );
        }
        // Static methods
        static getInstance(target, isInstance) {
          const elInCollection = window.$hsDatepickerCollection.find(
            (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
          );
          return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
        }
        static autoInit() {
          if (!window.$hsDatepickerCollection) window.$hsDatepickerCollection = [];
          document.querySelectorAll(".hs-datepicker:not(.--prevent-on-load-init)").forEach((el) => {
            if (!window.$hsDatepickerCollection.find(
              (elC) => elC?.element?.el === el
            )) {
              new _HSDatepicker(el);
            }
          });
        }
      };
      window.addEventListener("load", () => {
        HSDatepicker.autoInit();
      });
      if (typeof window !== "undefined") {
        window.HSDatepicker = HSDatepicker;
      }
      datepicker_default = HSDatepicker;
    }
  });

  // node_modules/axios/lib/helpers/bind.js
  function bind(fn, thisArg) {
    return function wrap() {
      return fn.apply(thisArg, arguments);
    };
  }

  // node_modules/axios/lib/utils.js
  var { toString } = Object.prototype;
  var { getPrototypeOf } = Object;
  var { iterator, toStringTag } = Symbol;
  var kindOf = /* @__PURE__ */ ((cache) => (thing) => {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  })(/* @__PURE__ */ Object.create(null));
  var kindOfTest = (type) => {
    type = type.toLowerCase();
    return (thing) => kindOf(thing) === type;
  };
  var typeOfTest = (type) => (thing) => typeof thing === type;
  var { isArray } = Array;
  var isUndefined = typeOfTest("undefined");
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
  }
  var isArrayBuffer = kindOfTest("ArrayBuffer");
  function isArrayBufferView(val) {
    let result;
    if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
      result = ArrayBuffer.isView(val);
    } else {
      result = val && val.buffer && isArrayBuffer(val.buffer);
    }
    return result;
  }
  var isString = typeOfTest("string");
  var isFunction = typeOfTest("function");
  var isNumber = typeOfTest("number");
  var isObject = (thing) => thing !== null && typeof thing === "object";
  var isBoolean = (thing) => thing === true || thing === false;
  var isPlainObject = (val) => {
    if (kindOf(val) !== "object") {
      return false;
    }
    const prototype3 = getPrototypeOf(val);
    return (prototype3 === null || prototype3 === Object.prototype || Object.getPrototypeOf(prototype3) === null) && !(toStringTag in val) && !(iterator in val);
  };
  var isEmptyObject = (val) => {
    if (!isObject(val) || isBuffer(val)) {
      return false;
    }
    try {
      return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
    } catch (e2) {
      return false;
    }
  };
  var isDate = kindOfTest("Date");
  var isFile = kindOfTest("File");
  var isBlob = kindOfTest("Blob");
  var isFileList = kindOfTest("FileList");
  var isStream = (val) => isObject(val) && isFunction(val.pipe);
  var isFormData = (thing) => {
    let kind;
    return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
    kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
  };
  var isURLSearchParams = kindOfTest("URLSearchParams");
  var [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
  var trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  function forEach(obj, fn, { allOwnKeys = false } = {}) {
    if (obj === null || typeof obj === "undefined") {
      return;
    }
    let i;
    let l;
    if (typeof obj !== "object") {
      obj = [obj];
    }
    if (isArray(obj)) {
      for (i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      if (isBuffer(obj)) {
        return;
      }
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        fn.call(null, obj[key], key, obj);
      }
    }
  }
  function findKey(obj, key) {
    if (isBuffer(obj)) {
      return null;
    }
    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
      _key = keys[i];
      if (key === _key.toLowerCase()) {
        return _key;
      }
    }
    return null;
  }
  var _global = (() => {
    if (typeof globalThis !== "undefined") return globalThis;
    return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
  })();
  var isContextDefined = (context) => !isUndefined(context) && context !== _global;
  function merge() {
    const { caseless, skipUndefined } = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key) => {
      const targetKey = caseless && findKey(result, key) || key;
      if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
        result[targetKey] = merge(result[targetKey], val);
      } else if (isPlainObject(val)) {
        result[targetKey] = merge({}, val);
      } else if (isArray(val)) {
        result[targetKey] = val.slice();
      } else if (!skipUndefined || !isUndefined(val)) {
        result[targetKey] = val;
      }
    };
    for (let i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
  }
  var extend = (a, b, thisArg, { allOwnKeys } = {}) => {
    forEach(b, (val, key) => {
      if (thisArg && isFunction(val)) {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    }, { allOwnKeys });
    return a;
  };
  var stripBOM = (content) => {
    if (content.charCodeAt(0) === 65279) {
      content = content.slice(1);
    }
    return content;
  };
  var inherits = (constructor, superConstructor, props, descriptors2) => {
    constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
    constructor.prototype.constructor = constructor;
    Object.defineProperty(constructor, "super", {
      value: superConstructor.prototype
    });
    props && Object.assign(constructor.prototype, props);
  };
  var toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
    let props;
    let i;
    let prop;
    const merged = {};
    destObj = destObj || {};
    if (sourceObj == null) return destObj;
    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props.length;
      while (i-- > 0) {
        prop = props[i];
        if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
          destObj[prop] = sourceObj[prop];
          merged[prop] = true;
        }
      }
      sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
    return destObj;
  };
  var endsWith = (str, searchString, position) => {
    str = String(str);
    if (position === void 0 || position > str.length) {
      position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
  var toArray = (thing) => {
    if (!thing) return null;
    if (isArray(thing)) return thing;
    let i = thing.length;
    if (!isNumber(i)) return null;
    const arr = new Array(i);
    while (i-- > 0) {
      arr[i] = thing[i];
    }
    return arr;
  };
  var isTypedArray = /* @__PURE__ */ ((TypedArray) => {
    return (thing) => {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
  var forEachEntry = (obj, fn) => {
    const generator = obj && obj[iterator];
    const _iterator = generator.call(obj);
    let result;
    while ((result = _iterator.next()) && !result.done) {
      const pair = result.value;
      fn.call(obj, pair[0], pair[1]);
    }
  };
  var matchAll = (regExp, str) => {
    let matches;
    const arr = [];
    while ((matches = regExp.exec(str)) !== null) {
      arr.push(matches);
    }
    return arr;
  };
  var isHTMLForm = kindOfTest("HTMLFormElement");
  var toCamelCase = (str) => {
    return str.toLowerCase().replace(
      /[-_\s]([a-z\d])(\w*)/g,
      function replacer(m, p1, p2) {
        return p1.toUpperCase() + p2;
      }
    );
  };
  var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
  var isRegExp = kindOfTest("RegExp");
  var reduceDescriptors = (obj, reducer) => {
    const descriptors2 = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};
    forEach(descriptors2, (descriptor, name) => {
      let ret;
      if ((ret = reducer(descriptor, name, obj)) !== false) {
        reducedDescriptors[name] = ret || descriptor;
      }
    });
    Object.defineProperties(obj, reducedDescriptors);
  };
  var freezeMethods = (obj) => {
    reduceDescriptors(obj, (descriptor, name) => {
      if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
        return false;
      }
      const value = obj[name];
      if (!isFunction(value)) return;
      descriptor.enumerable = false;
      if ("writable" in descriptor) {
        descriptor.writable = false;
        return;
      }
      if (!descriptor.set) {
        descriptor.set = () => {
          throw Error("Can not rewrite read-only method '" + name + "'");
        };
      }
    });
  };
  var toObjectSet = (arrayOrString, delimiter) => {
    const obj = {};
    const define = (arr) => {
      arr.forEach((value) => {
        obj[value] = true;
      });
    };
    isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
    return obj;
  };
  var noop = () => {
  };
  var toFiniteNumber = (value, defaultValue) => {
    return value != null && Number.isFinite(value = +value) ? value : defaultValue;
  };
  function isSpecCompliantForm(thing) {
    return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
  }
  var toJSONObject = (obj) => {
    const stack = new Array(10);
    const visit = (source, i) => {
      if (isObject(source)) {
        if (stack.indexOf(source) >= 0) {
          return;
        }
        if (isBuffer(source)) {
          return source;
        }
        if (!("toJSON" in source)) {
          stack[i] = source;
          const target = isArray(source) ? [] : {};
          forEach(source, (value, key) => {
            const reducedValue = visit(value, i + 1);
            !isUndefined(reducedValue) && (target[key] = reducedValue);
          });
          stack[i] = void 0;
          return target;
        }
      }
      return source;
    };
    return visit(obj, 0);
  };
  var isAsyncFn = kindOfTest("AsyncFunction");
  var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
  var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
    if (setImmediateSupported) {
      return setImmediate;
    }
    return postMessageSupported ? ((token, callbacks) => {
      _global.addEventListener("message", ({ source, data }) => {
        if (source === _global && data === token) {
          callbacks.length && callbacks.shift()();
        }
      }, false);
      return (cb) => {
        callbacks.push(cb);
        _global.postMessage(token, "*");
      };
    })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
  })(
    typeof setImmediate === "function",
    isFunction(_global.postMessage)
  );
  var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
  var isIterable = (thing) => thing != null && isFunction(thing[iterator]);
  var utils_default = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean,
    isObject,
    isPlainObject,
    isEmptyObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined,
    isDate,
    isFile,
    isBlob,
    isRegExp,
    isFunction,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty,
    // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap,
    isIterable
  };

  // node_modules/axios/lib/core/AxiosError.js
  function AxiosError(message, code, config, request, response) {
    Error.call(this);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.message = message;
    this.name = "AxiosError";
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
      this.response = response;
      this.status = response.status ? response.status : null;
    }
  }
  utils_default.inherits(AxiosError, Error, {
    toJSON: function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: utils_default.toJSONObject(this.config),
        code: this.code,
        status: this.status
      };
    }
  });
  var prototype = AxiosError.prototype;
  var descriptors = {};
  [
    "ERR_BAD_OPTION_VALUE",
    "ERR_BAD_OPTION",
    "ECONNABORTED",
    "ETIMEDOUT",
    "ERR_NETWORK",
    "ERR_FR_TOO_MANY_REDIRECTS",
    "ERR_DEPRECATED",
    "ERR_BAD_RESPONSE",
    "ERR_BAD_REQUEST",
    "ERR_CANCELED",
    "ERR_NOT_SUPPORT",
    "ERR_INVALID_URL"
    // eslint-disable-next-line func-names
  ].forEach((code) => {
    descriptors[code] = { value: code };
  });
  Object.defineProperties(AxiosError, descriptors);
  Object.defineProperty(prototype, "isAxiosError", { value: true });
  AxiosError.from = (error, code, config, request, response, customProps) => {
    const axiosError = Object.create(prototype);
    utils_default.toFlatObject(error, axiosError, function filter2(obj) {
      return obj !== Error.prototype;
    }, (prop) => {
      return prop !== "isAxiosError";
    });
    const msg = error && error.message ? error.message : "Error";
    const errCode = code == null && error ? error.code : code;
    AxiosError.call(axiosError, msg, errCode, config, request, response);
    if (error && axiosError.cause == null) {
      Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
    }
    axiosError.name = error && error.name || "Error";
    customProps && Object.assign(axiosError, customProps);
    return axiosError;
  };
  var AxiosError_default = AxiosError;

  // node_modules/axios/lib/helpers/null.js
  var null_default = null;

  // node_modules/axios/lib/helpers/toFormData.js
  function isVisitable(thing) {
    return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
  }
  function removeBrackets(key) {
    return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
  }
  function renderKey(path, key, dots) {
    if (!path) return key;
    return path.concat(key).map(function each(token, i) {
      token = removeBrackets(token);
      return !dots && i ? "[" + token + "]" : token;
    }).join(dots ? "." : "");
  }
  function isFlatArray(arr) {
    return utils_default.isArray(arr) && !arr.some(isVisitable);
  }
  var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
  });
  function toFormData(obj, formData, options) {
    if (!utils_default.isObject(obj)) {
      throw new TypeError("target must be an object");
    }
    formData = formData || new (null_default || FormData)();
    options = utils_default.toFlatObject(options, {
      metaTokens: true,
      dots: false,
      indexes: false
    }, false, function defined(option, source) {
      return !utils_default.isUndefined(source[option]);
    });
    const metaTokens = options.metaTokens;
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
    const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
    if (!utils_default.isFunction(visitor)) {
      throw new TypeError("visitor must be a function");
    }
    function convertValue(value) {
      if (value === null) return "";
      if (utils_default.isDate(value)) {
        return value.toISOString();
      }
      if (utils_default.isBoolean(value)) {
        return value.toString();
      }
      if (!useBlob && utils_default.isBlob(value)) {
        throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
      }
      if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
        return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
      }
      return value;
    }
    function defaultVisitor(value, key, path) {
      let arr = value;
      if (value && !path && typeof value === "object") {
        if (utils_default.endsWith(key, "{}")) {
          key = metaTokens ? key : key.slice(0, -2);
          value = JSON.stringify(value);
        } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
          key = removeBrackets(key);
          arr.forEach(function each(el, index) {
            !(utils_default.isUndefined(el) || el === null) && formData.append(
              // eslint-disable-next-line no-nested-ternary
              indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
              convertValue(el)
            );
          });
          return false;
        }
      }
      if (isVisitable(value)) {
        return true;
      }
      formData.append(renderKey(path, key, dots), convertValue(value));
      return false;
    }
    const stack = [];
    const exposedHelpers = Object.assign(predicates, {
      defaultVisitor,
      convertValue,
      isVisitable
    });
    function build(value, path) {
      if (utils_default.isUndefined(value)) return;
      if (stack.indexOf(value) !== -1) {
        throw Error("Circular reference detected in " + path.join("."));
      }
      stack.push(value);
      utils_default.forEach(value, function each(el, key) {
        const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(
          formData,
          el,
          utils_default.isString(key) ? key.trim() : key,
          path,
          exposedHelpers
        );
        if (result === true) {
          build(el, path ? path.concat(key) : [key]);
        }
      });
      stack.pop();
    }
    if (!utils_default.isObject(obj)) {
      throw new TypeError("data must be an object");
    }
    build(obj);
    return formData;
  }
  var toFormData_default = toFormData;

  // node_modules/axios/lib/helpers/AxiosURLSearchParams.js
  function encode(str) {
    const charMap = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
      return charMap[match];
    });
  }
  function AxiosURLSearchParams(params, options) {
    this._pairs = [];
    params && toFormData_default(params, this, options);
  }
  var prototype2 = AxiosURLSearchParams.prototype;
  prototype2.append = function append(name, value) {
    this._pairs.push([name, value]);
  };
  prototype2.toString = function toString2(encoder) {
    const _encode = encoder ? function(value) {
      return encoder.call(this, value, encode);
    } : encode;
    return this._pairs.map(function each(pair) {
      return _encode(pair[0]) + "=" + _encode(pair[1]);
    }, "").join("&");
  };
  var AxiosURLSearchParams_default = AxiosURLSearchParams;

  // node_modules/axios/lib/helpers/buildURL.js
  function encode2(val) {
    return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
  }
  function buildURL(url, params, options) {
    if (!params) {
      return url;
    }
    const _encode = options && options.encode || encode2;
    if (utils_default.isFunction(options)) {
      options = {
        serialize: options
      };
    }
    const serializeFn = options && options.serialize;
    let serializedParams;
    if (serializeFn) {
      serializedParams = serializeFn(params, options);
    } else {
      serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
    }
    if (serializedParams) {
      const hashmarkIndex = url.indexOf("#");
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
    }
    return url;
  }

  // node_modules/axios/lib/core/InterceptorManager.js
  var InterceptorManager = class {
    constructor() {
      this.handlers = [];
    }
    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    }
    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     *
     * @returns {void}
     */
    eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }
    /**
     * Clear all interceptors from the stack
     *
     * @returns {void}
     */
    clear() {
      if (this.handlers) {
        this.handlers = [];
      }
    }
    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     *
     * @returns {void}
     */
    forEach(fn) {
      utils_default.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    }
  };
  var InterceptorManager_default = InterceptorManager;

  // node_modules/axios/lib/defaults/transitional.js
  var transitional_default = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  // node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
  var URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;

  // node_modules/axios/lib/platform/browser/classes/FormData.js
  var FormData_default = typeof FormData !== "undefined" ? FormData : null;

  // node_modules/axios/lib/platform/browser/classes/Blob.js
  var Blob_default = typeof Blob !== "undefined" ? Blob : null;

  // node_modules/axios/lib/platform/browser/index.js
  var browser_default = {
    isBrowser: true,
    classes: {
      URLSearchParams: URLSearchParams_default,
      FormData: FormData_default,
      Blob: Blob_default
    },
    protocols: ["http", "https", "file", "blob", "url", "data"]
  };

  // node_modules/axios/lib/platform/common/utils.js
  var utils_exports = {};
  __export(utils_exports, {
    hasBrowserEnv: () => hasBrowserEnv,
    hasStandardBrowserEnv: () => hasStandardBrowserEnv,
    hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
    navigator: () => _navigator,
    origin: () => origin
  });
  var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
  var _navigator = typeof navigator === "object" && navigator || void 0;
  var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
  var hasStandardBrowserWebWorkerEnv = (() => {
    return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
    self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
  })();
  var origin = hasBrowserEnv && window.location.href || "http://localhost";

  // node_modules/axios/lib/platform/index.js
  var platform_default = {
    ...utils_exports,
    ...browser_default
  };

  // node_modules/axios/lib/helpers/toURLEncodedForm.js
  function toURLEncodedForm(data, options) {
    return toFormData_default(data, new platform_default.classes.URLSearchParams(), {
      visitor: function(value, key, path, helpers) {
        if (platform_default.isNode && utils_default.isBuffer(value)) {
          this.append(key, value.toString("base64"));
          return false;
        }
        return helpers.defaultVisitor.apply(this, arguments);
      },
      ...options
    });
  }

  // node_modules/axios/lib/helpers/formDataToJSON.js
  function parsePropPath(name) {
    return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
      return match[0] === "[]" ? "" : match[1] || match[0];
    });
  }
  function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = arr[key];
    }
    return obj;
  }
  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      let name = path[index++];
      if (name === "__proto__") return true;
      const isNumericKey = Number.isFinite(+name);
      const isLast = index >= path.length;
      name = !name && utils_default.isArray(target) ? target.length : name;
      if (isLast) {
        if (utils_default.hasOwnProp(target, name)) {
          target[name] = [target[name], value];
        } else {
          target[name] = value;
        }
        return !isNumericKey;
      }
      if (!target[name] || !utils_default.isObject(target[name])) {
        target[name] = [];
      }
      const result = buildPath(path, value, target[name], index);
      if (result && utils_default.isArray(target[name])) {
        target[name] = arrayToObject(target[name]);
      }
      return !isNumericKey;
    }
    if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
      const obj = {};
      utils_default.forEachEntry(formData, (name, value) => {
        buildPath(parsePropPath(name), value, obj, 0);
      });
      return obj;
    }
    return null;
  }
  var formDataToJSON_default = formDataToJSON;

  // node_modules/axios/lib/defaults/index.js
  function stringifySafely(rawValue, parser, encoder) {
    if (utils_default.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils_default.trim(rawValue);
      } catch (e2) {
        if (e2.name !== "SyntaxError") {
          throw e2;
        }
      }
    }
    return (encoder || JSON.stringify)(rawValue);
  }
  var defaults = {
    transitional: transitional_default,
    adapter: ["xhr", "http", "fetch"],
    transformRequest: [function transformRequest(data, headers) {
      const contentType = headers.getContentType() || "";
      const hasJSONContentType = contentType.indexOf("application/json") > -1;
      const isObjectPayload = utils_default.isObject(data);
      if (isObjectPayload && utils_default.isHTMLForm(data)) {
        data = new FormData(data);
      }
      const isFormData2 = utils_default.isFormData(data);
      if (isFormData2) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
      }
      if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
        return data;
      }
      if (utils_default.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils_default.isURLSearchParams(data)) {
        headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
        return data.toString();
      }
      let isFileList2;
      if (isObjectPayload) {
        if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
          return toURLEncodedForm(data, this.formSerializer).toString();
        }
        if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
          const _FormData = this.env && this.env.FormData;
          return toFormData_default(
            isFileList2 ? { "files[]": data } : data,
            _FormData && new _FormData(),
            this.formSerializer
          );
        }
      }
      if (isObjectPayload || hasJSONContentType) {
        headers.setContentType("application/json", false);
        return stringifySafely(data);
      }
      return data;
    }],
    transformResponse: [function transformResponse(data) {
      const transitional2 = this.transitional || defaults.transitional;
      const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
      const JSONRequested = this.responseType === "json";
      if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
        return data;
      }
      if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
        const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
        const strictJSONParsing = !silentJSONParsing && JSONRequested;
        try {
          return JSON.parse(data, this.parseReviver);
        } catch (e2) {
          if (strictJSONParsing) {
            if (e2.name === "SyntaxError") {
              throw AxiosError_default.from(e2, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
            }
            throw e2;
          }
        }
      }
      return data;
    }],
    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: platform_default.classes.FormData,
      Blob: platform_default.classes.Blob
    },
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },
    headers: {
      common: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": void 0
      }
    }
  };
  utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
    defaults.headers[method] = {};
  });
  var defaults_default = defaults;

  // node_modules/axios/lib/helpers/parseHeaders.js
  var ignoreDuplicateOf = utils_default.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent"
  ]);
  var parseHeaders_default = (rawHeaders) => {
    const parsed = {};
    let key;
    let val;
    let i;
    rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
      i = line.indexOf(":");
      key = line.substring(0, i).trim().toLowerCase();
      val = line.substring(i + 1).trim();
      if (!key || parsed[key] && ignoreDuplicateOf[key]) {
        return;
      }
      if (key === "set-cookie") {
        if (parsed[key]) {
          parsed[key].push(val);
        } else {
          parsed[key] = [val];
        }
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
      }
    });
    return parsed;
  };

  // node_modules/axios/lib/core/AxiosHeaders.js
  var $internals = Symbol("internals");
  function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
  }
  function normalizeValue(value) {
    if (value === false || value == null) {
      return value;
    }
    return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
  }
  function parseTokens(str) {
    const tokens = /* @__PURE__ */ Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;
    while (match = tokensRE.exec(str)) {
      tokens[match[1]] = match[2];
    }
    return tokens;
  }
  var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
  function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
    if (utils_default.isFunction(filter2)) {
      return filter2.call(this, value, header);
    }
    if (isHeaderNameFilter) {
      value = header;
    }
    if (!utils_default.isString(value)) return;
    if (utils_default.isString(filter2)) {
      return value.indexOf(filter2) !== -1;
    }
    if (utils_default.isRegExp(filter2)) {
      return filter2.test(value);
    }
  }
  function formatHeader(header) {
    return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
      return char.toUpperCase() + str;
    });
  }
  function buildAccessors(obj, header) {
    const accessorName = utils_default.toCamelCase(" " + header);
    ["get", "set", "has"].forEach((methodName) => {
      Object.defineProperty(obj, methodName + accessorName, {
        value: function(arg1, arg2, arg3) {
          return this[methodName].call(this, header, arg1, arg2, arg3);
        },
        configurable: true
      });
    });
  }
  var AxiosHeaders = class {
    constructor(headers) {
      headers && this.set(headers);
    }
    set(header, valueOrRewrite, rewrite) {
      const self2 = this;
      function setHeader(_value, _header, _rewrite) {
        const lHeader = normalizeHeader(_header);
        if (!lHeader) {
          throw new Error("header name must be a non-empty string");
        }
        const key = utils_default.findKey(self2, lHeader);
        if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
          self2[key || _header] = normalizeValue(_value);
        }
      }
      const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
      if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
        setHeaders(header, valueOrRewrite);
      } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
        setHeaders(parseHeaders_default(header), valueOrRewrite);
      } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
        let obj = {}, dest, key;
        for (const entry of header) {
          if (!utils_default.isArray(entry)) {
            throw TypeError("Object iterator must return a key-value pair");
          }
          obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
        }
        setHeaders(obj, valueOrRewrite);
      } else {
        header != null && setHeader(valueOrRewrite, header, rewrite);
      }
      return this;
    }
    get(header, parser) {
      header = normalizeHeader(header);
      if (header) {
        const key = utils_default.findKey(this, header);
        if (key) {
          const value = this[key];
          if (!parser) {
            return value;
          }
          if (parser === true) {
            return parseTokens(value);
          }
          if (utils_default.isFunction(parser)) {
            return parser.call(this, value, key);
          }
          if (utils_default.isRegExp(parser)) {
            return parser.exec(value);
          }
          throw new TypeError("parser must be boolean|regexp|function");
        }
      }
    }
    has(header, matcher) {
      header = normalizeHeader(header);
      if (header) {
        const key = utils_default.findKey(this, header);
        return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
      }
      return false;
    }
    delete(header, matcher) {
      const self2 = this;
      let deleted = false;
      function deleteHeader(_header) {
        _header = normalizeHeader(_header);
        if (_header) {
          const key = utils_default.findKey(self2, _header);
          if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
            delete self2[key];
            deleted = true;
          }
        }
      }
      if (utils_default.isArray(header)) {
        header.forEach(deleteHeader);
      } else {
        deleteHeader(header);
      }
      return deleted;
    }
    clear(matcher) {
      const keys = Object.keys(this);
      let i = keys.length;
      let deleted = false;
      while (i--) {
        const key = keys[i];
        if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
          delete this[key];
          deleted = true;
        }
      }
      return deleted;
    }
    normalize(format) {
      const self2 = this;
      const headers = {};
      utils_default.forEach(this, (value, header) => {
        const key = utils_default.findKey(headers, header);
        if (key) {
          self2[key] = normalizeValue(value);
          delete self2[header];
          return;
        }
        const normalized = format ? formatHeader(header) : String(header).trim();
        if (normalized !== header) {
          delete self2[header];
        }
        self2[normalized] = normalizeValue(value);
        headers[normalized] = true;
      });
      return this;
    }
    concat(...targets) {
      return this.constructor.concat(this, ...targets);
    }
    toJSON(asStrings) {
      const obj = /* @__PURE__ */ Object.create(null);
      utils_default.forEach(this, (value, header) => {
        value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
      });
      return obj;
    }
    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }
    toString() {
      return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
    }
    getSetCookie() {
      return this.get("set-cookie") || [];
    }
    get [Symbol.toStringTag]() {
      return "AxiosHeaders";
    }
    static from(thing) {
      return thing instanceof this ? thing : new this(thing);
    }
    static concat(first, ...targets) {
      const computed = new this(first);
      targets.forEach((target) => computed.set(target));
      return computed;
    }
    static accessor(header) {
      const internals = this[$internals] = this[$internals] = {
        accessors: {}
      };
      const accessors = internals.accessors;
      const prototype3 = this.prototype;
      function defineAccessor(_header) {
        const lHeader = normalizeHeader(_header);
        if (!accessors[lHeader]) {
          buildAccessors(prototype3, _header);
          accessors[lHeader] = true;
        }
      }
      utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
      return this;
    }
  };
  AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
  utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
    let mapped = key[0].toUpperCase() + key.slice(1);
    return {
      get: () => value,
      set(headerValue) {
        this[mapped] = headerValue;
      }
    };
  });
  utils_default.freezeMethods(AxiosHeaders);
  var AxiosHeaders_default = AxiosHeaders;

  // node_modules/axios/lib/core/transformData.js
  function transformData(fns, response) {
    const config = this || defaults_default;
    const context = response || config;
    const headers = AxiosHeaders_default.from(context.headers);
    let data = context.data;
    utils_default.forEach(fns, function transform(fn) {
      data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
    });
    headers.normalize();
    return data;
  }

  // node_modules/axios/lib/cancel/isCancel.js
  function isCancel(value) {
    return !!(value && value.__CANCEL__);
  }

  // node_modules/axios/lib/cancel/CanceledError.js
  function CanceledError(message, config, request) {
    AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
    this.name = "CanceledError";
  }
  utils_default.inherits(CanceledError, AxiosError_default, {
    __CANCEL__: true
  });
  var CanceledError_default = CanceledError;

  // node_modules/axios/lib/core/settle.js
  function settle(resolve, reject, response) {
    const validateStatus2 = response.config.validateStatus;
    if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
      resolve(response);
    } else {
      reject(new AxiosError_default(
        "Request failed with status code " + response.status,
        [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
        response.config,
        response.request,
        response
      ));
    }
  }

  // node_modules/axios/lib/helpers/parseProtocol.js
  function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || "";
  }

  // node_modules/axios/lib/helpers/speedometer.js
  function speedometer(samplesCount, min2) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;
    min2 = min2 !== void 0 ? min2 : 1e3;
    return function push(chunkLength) {
      const now = Date.now();
      const startedAt = timestamps[tail];
      if (!firstSampleTS) {
        firstSampleTS = now;
      }
      bytes[head] = chunkLength;
      timestamps[head] = now;
      let i = tail;
      let bytesCount = 0;
      while (i !== head) {
        bytesCount += bytes[i++];
        i = i % samplesCount;
      }
      head = (head + 1) % samplesCount;
      if (head === tail) {
        tail = (tail + 1) % samplesCount;
      }
      if (now - firstSampleTS < min2) {
        return;
      }
      const passed = startedAt && now - startedAt;
      return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
    };
  }
  var speedometer_default = speedometer;

  // node_modules/axios/lib/helpers/throttle.js
  function throttle(fn, freq) {
    let timestamp = 0;
    let threshold = 1e3 / freq;
    let lastArgs;
    let timer;
    const invoke = (args, now = Date.now()) => {
      timestamp = now;
      lastArgs = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn(...args);
    };
    const throttled = (...args) => {
      const now = Date.now();
      const passed = now - timestamp;
      if (passed >= threshold) {
        invoke(args, now);
      } else {
        lastArgs = args;
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            invoke(lastArgs);
          }, threshold - passed);
        }
      }
    };
    const flush = () => lastArgs && invoke(lastArgs);
    return [throttled, flush];
  }
  var throttle_default = throttle;

  // node_modules/axios/lib/helpers/progressEventReducer.js
  var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
    let bytesNotified = 0;
    const _speedometer = speedometer_default(50, 250);
    return throttle_default((e2) => {
      const loaded = e2.loaded;
      const total = e2.lengthComputable ? e2.total : void 0;
      const progressBytes = loaded - bytesNotified;
      const rate = _speedometer(progressBytes);
      const inRange = loaded <= total;
      bytesNotified = loaded;
      const data = {
        loaded,
        total,
        progress: total ? loaded / total : void 0,
        bytes: progressBytes,
        rate: rate ? rate : void 0,
        estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
        event: e2,
        lengthComputable: total != null,
        [isDownloadStream ? "download" : "upload"]: true
      };
      listener(data);
    }, freq);
  };
  var progressEventDecorator = (total, throttled) => {
    const lengthComputable = total != null;
    return [(loaded) => throttled[0]({
      lengthComputable,
      total,
      loaded
    }), throttled[1]];
  };
  var asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));

  // node_modules/axios/lib/helpers/isURLSameOrigin.js
  var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
    url = new URL(url, platform_default.origin);
    return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
  })(
    new URL(platform_default.origin),
    platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
  ) : () => true;

  // node_modules/axios/lib/helpers/cookies.js
  var cookies_default = platform_default.hasStandardBrowserEnv ? (
    // Standard browser envs support document.cookie
    {
      write(name, value, expires, path, domain, secure, sameSite) {
        if (typeof document === "undefined") return;
        const cookie = [`${name}=${encodeURIComponent(value)}`];
        if (utils_default.isNumber(expires)) {
          cookie.push(`expires=${new Date(expires).toUTCString()}`);
        }
        if (utils_default.isString(path)) {
          cookie.push(`path=${path}`);
        }
        if (utils_default.isString(domain)) {
          cookie.push(`domain=${domain}`);
        }
        if (secure === true) {
          cookie.push("secure");
        }
        if (utils_default.isString(sameSite)) {
          cookie.push(`SameSite=${sameSite}`);
        }
        document.cookie = cookie.join("; ");
      },
      read(name) {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
        return match ? decodeURIComponent(match[1]) : null;
      },
      remove(name) {
        this.write(name, "", Date.now() - 864e5, "/");
      }
    }
  ) : (
    // Non-standard browser env (web workers, react-native) lack needed support.
    {
      write() {
      },
      read() {
        return null;
      },
      remove() {
      }
    }
  );

  // node_modules/axios/lib/helpers/isAbsoluteURL.js
  function isAbsoluteURL(url) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  // node_modules/axios/lib/helpers/combineURLs.js
  function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
  }

  // node_modules/axios/lib/core/buildFullPath.js
  function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
    let isRelativeUrl = !isAbsoluteURL(requestedURL);
    if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }

  // node_modules/axios/lib/core/mergeConfig.js
  var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
  function mergeConfig(config1, config2) {
    config2 = config2 || {};
    const config = {};
    function getMergedValue(target, source, prop, caseless) {
      if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
        return utils_default.merge.call({ caseless }, target, source);
      } else if (utils_default.isPlainObject(source)) {
        return utils_default.merge({}, source);
      } else if (utils_default.isArray(source)) {
        return source.slice();
      }
      return source;
    }
    function mergeDeepProperties(a, b, prop, caseless) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(a, b, prop, caseless);
      } else if (!utils_default.isUndefined(a)) {
        return getMergedValue(void 0, a, prop, caseless);
      }
    }
    function valueFromConfig2(a, b) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(void 0, b);
      }
    }
    function defaultToConfig2(a, b) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(void 0, b);
      } else if (!utils_default.isUndefined(a)) {
        return getMergedValue(void 0, a);
      }
    }
    function mergeDirectKeys(a, b, prop) {
      if (prop in config2) {
        return getMergedValue(a, b);
      } else if (prop in config1) {
        return getMergedValue(void 0, a);
      }
    }
    const mergeMap = {
      url: valueFromConfig2,
      method: valueFromConfig2,
      data: valueFromConfig2,
      baseURL: defaultToConfig2,
      transformRequest: defaultToConfig2,
      transformResponse: defaultToConfig2,
      paramsSerializer: defaultToConfig2,
      timeout: defaultToConfig2,
      timeoutMessage: defaultToConfig2,
      withCredentials: defaultToConfig2,
      withXSRFToken: defaultToConfig2,
      adapter: defaultToConfig2,
      responseType: defaultToConfig2,
      xsrfCookieName: defaultToConfig2,
      xsrfHeaderName: defaultToConfig2,
      onUploadProgress: defaultToConfig2,
      onDownloadProgress: defaultToConfig2,
      decompress: defaultToConfig2,
      maxContentLength: defaultToConfig2,
      maxBodyLength: defaultToConfig2,
      beforeRedirect: defaultToConfig2,
      transport: defaultToConfig2,
      httpAgent: defaultToConfig2,
      httpsAgent: defaultToConfig2,
      cancelToken: defaultToConfig2,
      socketPath: defaultToConfig2,
      responseEncoding: defaultToConfig2,
      validateStatus: mergeDirectKeys,
      headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
    };
    utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
      const merge2 = mergeMap[prop] || mergeDeepProperties;
      const configValue = merge2(config1[prop], config2[prop], prop);
      utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
    });
    return config;
  }

  // node_modules/axios/lib/helpers/resolveConfig.js
  var resolveConfig_default = (config) => {
    const newConfig = mergeConfig({}, config);
    let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
    newConfig.headers = headers = AxiosHeaders_default.from(headers);
    newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
    if (auth) {
      headers.set(
        "Authorization",
        "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
      );
    }
    if (utils_default.isFormData(data)) {
      if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
        headers.setContentType(void 0);
      } else if (utils_default.isFunction(data.getHeaders)) {
        const formHeaders = data.getHeaders();
        const allowedHeaders = ["content-type", "content-length"];
        Object.entries(formHeaders).forEach(([key, val]) => {
          if (allowedHeaders.includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
      }
    }
    if (platform_default.hasStandardBrowserEnv) {
      withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
      if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
        const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
        if (xsrfValue) {
          headers.set(xsrfHeaderName, xsrfValue);
        }
      }
    }
    return newConfig;
  };

  // node_modules/axios/lib/adapters/xhr.js
  var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
  var xhr_default = isXHRAdapterSupported && function(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      const _config = resolveConfig_default(config);
      let requestData = _config.data;
      const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
      let { responseType, onUploadProgress, onDownloadProgress } = _config;
      let onCanceled;
      let uploadThrottled, downloadThrottled;
      let flushUpload, flushDownload;
      function done() {
        flushUpload && flushUpload();
        flushDownload && flushDownload();
        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
        _config.signal && _config.signal.removeEventListener("abort", onCanceled);
      }
      let request = new XMLHttpRequest();
      request.open(_config.method.toUpperCase(), _config.url, true);
      request.timeout = _config.timeout;
      function onloadend() {
        if (!request) {
          return;
        }
        const responseHeaders = AxiosHeaders_default.from(
          "getAllResponseHeaders" in request && request.getAllResponseHeaders()
        );
        const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        };
        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);
        request = null;
      }
      if ("onloadend" in request) {
        request.onloadend = onloadend;
      } else {
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
            return;
          }
          setTimeout(onloadend);
        };
      }
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }
        reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
        request = null;
      };
      request.onerror = function handleError(event) {
        const msg = event && event.message ? event.message : "Network Error";
        const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
        err.event = event || null;
        reject(err);
        request = null;
      };
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional2 = _config.transitional || transitional_default;
        if (_config.timeoutErrorMessage) {
          timeoutErrorMessage = _config.timeoutErrorMessage;
        }
        reject(new AxiosError_default(
          timeoutErrorMessage,
          transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
          config,
          request
        ));
        request = null;
      };
      requestData === void 0 && requestHeaders.setContentType(null);
      if ("setRequestHeader" in request) {
        utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
          request.setRequestHeader(key, val);
        });
      }
      if (!utils_default.isUndefined(_config.withCredentials)) {
        request.withCredentials = !!_config.withCredentials;
      }
      if (responseType && responseType !== "json") {
        request.responseType = _config.responseType;
      }
      if (onDownloadProgress) {
        [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
        request.addEventListener("progress", downloadThrottled);
      }
      if (onUploadProgress && request.upload) {
        [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
        request.upload.addEventListener("progress", uploadThrottled);
        request.upload.addEventListener("loadend", flushUpload);
      }
      if (_config.cancelToken || _config.signal) {
        onCanceled = (cancel) => {
          if (!request) {
            return;
          }
          reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
          request.abort();
          request = null;
        };
        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
        if (_config.signal) {
          _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
        }
      }
      const protocol = parseProtocol(_config.url);
      if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
        reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
        return;
      }
      request.send(requestData || null);
    });
  };

  // node_modules/axios/lib/helpers/composeSignals.js
  var composeSignals = (signals, timeout) => {
    const { length } = signals = signals ? signals.filter(Boolean) : [];
    if (timeout || length) {
      let controller = new AbortController();
      let aborted;
      const onabort = function(reason) {
        if (!aborted) {
          aborted = true;
          unsubscribe();
          const err = reason instanceof Error ? reason : this.reason;
          controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
        }
      };
      let timer = timeout && setTimeout(() => {
        timer = null;
        onabort(new AxiosError_default(`timeout ${timeout} of ms exceeded`, AxiosError_default.ETIMEDOUT));
      }, timeout);
      const unsubscribe = () => {
        if (signals) {
          timer && clearTimeout(timer);
          timer = null;
          signals.forEach((signal2) => {
            signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
          });
          signals = null;
        }
      };
      signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
      const { signal } = controller;
      signal.unsubscribe = () => utils_default.asap(unsubscribe);
      return signal;
    }
  };
  var composeSignals_default = composeSignals;

  // node_modules/axios/lib/helpers/trackStream.js
  var streamChunk = function* (chunk, chunkSize) {
    let len = chunk.byteLength;
    if (!chunkSize || len < chunkSize) {
      yield chunk;
      return;
    }
    let pos = 0;
    let end;
    while (pos < len) {
      end = pos + chunkSize;
      yield chunk.slice(pos, end);
      pos = end;
    }
  };
  var readBytes = async function* (iterable, chunkSize) {
    for await (const chunk of readStream(iterable)) {
      yield* streamChunk(chunk, chunkSize);
    }
  };
  var readStream = async function* (stream) {
    if (stream[Symbol.asyncIterator]) {
      yield* stream;
      return;
    }
    const reader = stream.getReader();
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      await reader.cancel();
    }
  };
  var trackStream = (stream, chunkSize, onProgress, onFinish) => {
    const iterator2 = readBytes(stream, chunkSize);
    let bytes = 0;
    let done;
    let _onFinish = (e2) => {
      if (!done) {
        done = true;
        onFinish && onFinish(e2);
      }
    };
    return new ReadableStream({
      async pull(controller) {
        try {
          const { done: done2, value } = await iterator2.next();
          if (done2) {
            _onFinish();
            controller.close();
            return;
          }
          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = bytes += len;
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      },
      cancel(reason) {
        _onFinish(reason);
        return iterator2.return();
      }
    }, {
      highWaterMark: 2
    });
  };

  // node_modules/axios/lib/adapters/fetch.js
  var DEFAULT_CHUNK_SIZE = 64 * 1024;
  var { isFunction: isFunction2 } = utils_default;
  var globalFetchAPI = (({ Request, Response }) => ({
    Request,
    Response
  }))(utils_default.global);
  var {
    ReadableStream: ReadableStream2,
    TextEncoder
  } = utils_default.global;
  var test = (fn, ...args) => {
    try {
      return !!fn(...args);
    } catch (e2) {
      return false;
    }
  };
  var factory = (env) => {
    env = utils_default.merge.call({
      skipUndefined: true
    }, globalFetchAPI, env);
    const { fetch: envFetch, Request, Response } = env;
    const isFetchSupported = envFetch ? isFunction2(envFetch) : typeof fetch === "function";
    const isRequestSupported = isFunction2(Request);
    const isResponseSupported = isFunction2(Response);
    if (!isFetchSupported) {
      return false;
    }
    const isReadableStreamSupported = isFetchSupported && isFunction2(ReadableStream2);
    const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
    const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
      let duplexAccessed = false;
      const hasContentType = new Request(platform_default.origin, {
        body: new ReadableStream2(),
        method: "POST",
        get duplex() {
          duplexAccessed = true;
          return "half";
        }
      }).headers.has("Content-Type");
      return duplexAccessed && !hasContentType;
    });
    const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response("").body));
    const resolvers = {
      stream: supportsResponseStream && ((res) => res.body)
    };
    isFetchSupported && (() => {
      ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
        !resolvers[type] && (resolvers[type] = (res, config) => {
          let method = res && res[type];
          if (method) {
            return method.call(res);
          }
          throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
        });
      });
    })();
    const getBodyLength = async (body) => {
      if (body == null) {
        return 0;
      }
      if (utils_default.isBlob(body)) {
        return body.size;
      }
      if (utils_default.isSpecCompliantForm(body)) {
        const _request = new Request(platform_default.origin, {
          method: "POST",
          body
        });
        return (await _request.arrayBuffer()).byteLength;
      }
      if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
        return body.byteLength;
      }
      if (utils_default.isURLSearchParams(body)) {
        body = body + "";
      }
      if (utils_default.isString(body)) {
        return (await encodeText(body)).byteLength;
      }
    };
    const resolveBodyLength = async (headers, body) => {
      const length = utils_default.toFiniteNumber(headers.getContentLength());
      return length == null ? getBodyLength(body) : length;
    };
    return async (config) => {
      let {
        url,
        method,
        data,
        signal,
        cancelToken,
        timeout,
        onDownloadProgress,
        onUploadProgress,
        responseType,
        headers,
        withCredentials = "same-origin",
        fetchOptions
      } = resolveConfig_default(config);
      let _fetch = envFetch || fetch;
      responseType = responseType ? (responseType + "").toLowerCase() : "text";
      let composedSignal = composeSignals_default([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
      let request = null;
      const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
        composedSignal.unsubscribe();
      });
      let requestContentLength;
      try {
        if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
          let _request = new Request(url, {
            method: "POST",
            body: data,
            duplex: "half"
          });
          let contentTypeHeader;
          if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
            headers.setContentType(contentTypeHeader);
          }
          if (_request.body) {
            const [onProgress, flush] = progressEventDecorator(
              requestContentLength,
              progressEventReducer(asyncDecorator(onUploadProgress))
            );
            data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
          }
        }
        if (!utils_default.isString(withCredentials)) {
          withCredentials = withCredentials ? "include" : "omit";
        }
        const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
        const resolvedOptions = {
          ...fetchOptions,
          signal: composedSignal,
          method: method.toUpperCase(),
          headers: headers.normalize().toJSON(),
          body: data,
          duplex: "half",
          credentials: isCredentialsSupported ? withCredentials : void 0
        };
        request = isRequestSupported && new Request(url, resolvedOptions);
        let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
        const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
        if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
          const options = {};
          ["status", "statusText", "headers"].forEach((prop) => {
            options[prop] = response[prop];
          });
          const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
          const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
            responseContentLength,
            progressEventReducer(asyncDecorator(onDownloadProgress), true)
          ) || [];
          response = new Response(
            trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
              flush && flush();
              unsubscribe && unsubscribe();
            }),
            options
          );
        }
        responseType = responseType || "text";
        let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
        !isStreamResponse && unsubscribe && unsubscribe();
        return await new Promise((resolve, reject) => {
          settle(resolve, reject, {
            data: responseData,
            headers: AxiosHeaders_default.from(response.headers),
            status: response.status,
            statusText: response.statusText,
            config,
            request
          });
        });
      } catch (err) {
        unsubscribe && unsubscribe();
        if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
          throw Object.assign(
            new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request),
            {
              cause: err.cause || err
            }
          );
        }
        throw AxiosError_default.from(err, err && err.code, config, request);
      }
    };
  };
  var seedCache = /* @__PURE__ */ new Map();
  var getFetch = (config) => {
    let env = config && config.env || {};
    const { fetch: fetch2, Request, Response } = env;
    const seeds = [
      Request,
      Response,
      fetch2
    ];
    let len = seeds.length, i = len, seed, target, map = seedCache;
    while (i--) {
      seed = seeds[i];
      target = map.get(seed);
      target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
      map = target;
    }
    return target;
  };
  var adapter = getFetch();

  // node_modules/axios/lib/adapters/adapters.js
  var knownAdapters = {
    http: null_default,
    xhr: xhr_default,
    fetch: {
      get: getFetch
    }
  };
  utils_default.forEach(knownAdapters, (fn, value) => {
    if (fn) {
      try {
        Object.defineProperty(fn, "name", { value });
      } catch (e2) {
      }
      Object.defineProperty(fn, "adapterName", { value });
    }
  });
  var renderReason = (reason) => `- ${reason}`;
  var isResolvedHandle = (adapter2) => utils_default.isFunction(adapter2) || adapter2 === null || adapter2 === false;
  function getAdapter(adapters, config) {
    adapters = utils_default.isArray(adapters) ? adapters : [adapters];
    const { length } = adapters;
    let nameOrAdapter;
    let adapter2;
    const rejectedReasons = {};
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;
      adapter2 = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter2 === void 0) {
          throw new AxiosError_default(`Unknown adapter '${id}'`);
        }
      }
      if (adapter2 && (utils_default.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter2;
    }
    if (!adapter2) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state2]) => `adapter ${id} ` + (state2 === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError_default(
        `There is no suitable adapter to dispatch the request ` + s,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter2;
  }
  var adapters_default = {
    /**
     * Resolve an adapter from a list of adapter names or functions.
     * @type {Function}
     */
    getAdapter,
    /**
     * Exposes all known adapters
     * @type {Object<string, Function|Object>}
     */
    adapters: knownAdapters
  };

  // node_modules/axios/lib/core/dispatchRequest.js
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
    if (config.signal && config.signal.aborted) {
      throw new CanceledError_default(null, config);
    }
  }
  function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    config.headers = AxiosHeaders_default.from(config.headers);
    config.data = transformData.call(
      config,
      config.transformRequest
    );
    if (["post", "put", "patch"].indexOf(config.method) !== -1) {
      config.headers.setContentType("application/x-www-form-urlencoded", false);
    }
    const adapter2 = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
    return adapter2(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);
      response.data = transformData.call(
        config,
        config.transformResponse,
        response
      );
      response.headers = AxiosHeaders_default.from(response.headers);
      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            config.transformResponse,
            reason.response
          );
          reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
        }
      }
      return Promise.reject(reason);
    });
  }

  // node_modules/axios/lib/env/data.js
  var VERSION = "1.13.2";

  // node_modules/axios/lib/helpers/validator.js
  var validators = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
    validators[type] = function validator(thing) {
      return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
    };
  });
  var deprecatedWarnings = {};
  validators.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
    }
    return (value, opt, opts) => {
      if (validator === false) {
        throw new AxiosError_default(
          formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
          AxiosError_default.ERR_DEPRECATED
        );
      }
      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        console.warn(
          formatMessage(
            opt,
            " has been deprecated since v" + version + " and will be removed in the near future"
          )
        );
      }
      return validator ? validator(value, opt, opts) : true;
    };
  };
  validators.spelling = function spelling(correctSpelling) {
    return (value, opt) => {
      console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
      return true;
    };
  };
  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== "object") {
      throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while (i-- > 0) {
      const opt = keys[i];
      const validator = schema[opt];
      if (validator) {
        const value = options[opt];
        const result = value === void 0 || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
      }
    }
  }
  var validator_default = {
    assertOptions,
    validators
  };

  // node_modules/axios/lib/core/Axios.js
  var validators2 = validator_default.validators;
  var Axios = class {
    constructor(instanceConfig) {
      this.defaults = instanceConfig || {};
      this.interceptors = {
        request: new InterceptorManager_default(),
        response: new InterceptorManager_default()
      };
    }
    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    async request(configOrUrl, config) {
      try {
        return await this._request(configOrUrl, config);
      } catch (err) {
        if (err instanceof Error) {
          let dummy = {};
          Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
          const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
          try {
            if (!err.stack) {
              err.stack = stack;
            } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
              err.stack += "\n" + stack;
            }
          } catch (e2) {
          }
        }
        throw err;
      }
    }
    _request(configOrUrl, config) {
      if (typeof configOrUrl === "string") {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }
      config = mergeConfig(this.defaults, config);
      const { transitional: transitional2, paramsSerializer, headers } = config;
      if (transitional2 !== void 0) {
        validator_default.assertOptions(transitional2, {
          silentJSONParsing: validators2.transitional(validators2.boolean),
          forcedJSONParsing: validators2.transitional(validators2.boolean),
          clarifyTimeoutError: validators2.transitional(validators2.boolean)
        }, false);
      }
      if (paramsSerializer != null) {
        if (utils_default.isFunction(paramsSerializer)) {
          config.paramsSerializer = {
            serialize: paramsSerializer
          };
        } else {
          validator_default.assertOptions(paramsSerializer, {
            encode: validators2.function,
            serialize: validators2.function
          }, true);
        }
      }
      if (config.allowAbsoluteUrls !== void 0) {
      } else if (this.defaults.allowAbsoluteUrls !== void 0) {
        config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
      } else {
        config.allowAbsoluteUrls = true;
      }
      validator_default.assertOptions(config, {
        baseUrl: validators2.spelling("baseURL"),
        withXsrfToken: validators2.spelling("withXSRFToken")
      }, true);
      config.method = (config.method || this.defaults.method || "get").toLowerCase();
      let contextHeaders = headers && utils_default.merge(
        headers.common,
        headers[config.method]
      );
      headers && utils_default.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        (method) => {
          delete headers[method];
        }
      );
      config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
      const requestInterceptorChain = [];
      let synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
          return;
        }
        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      const responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });
      let promise;
      let i = 0;
      let len;
      if (!synchronousRequestInterceptors) {
        const chain = [dispatchRequest.bind(this), void 0];
        chain.unshift(...requestInterceptorChain);
        chain.push(...responseInterceptorChain);
        len = chain.length;
        promise = Promise.resolve(config);
        while (i < len) {
          promise = promise.then(chain[i++], chain[i++]);
        }
        return promise;
      }
      len = requestInterceptorChain.length;
      let newConfig = config;
      while (i < len) {
        const onFulfilled = requestInterceptorChain[i++];
        const onRejected = requestInterceptorChain[i++];
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected.call(this, error);
          break;
        }
      }
      try {
        promise = dispatchRequest.call(this, newConfig);
      } catch (error) {
        return Promise.reject(error);
      }
      i = 0;
      len = responseInterceptorChain.length;
      while (i < len) {
        promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
      }
      return promise;
    }
    getUri(config) {
      config = mergeConfig(this.defaults, config);
      const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    }
  };
  utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
    Axios.prototype[method] = function(url, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        url,
        data: (config || {}).data
      }));
    };
  });
  utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          headers: isForm ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url,
          data
        }));
      };
    }
    Axios.prototype[method] = generateHTTPMethod();
    Axios.prototype[method + "Form"] = generateHTTPMethod(true);
  });
  var Axios_default = Axios;

  // node_modules/axios/lib/cancel/CancelToken.js
  var CancelToken = class _CancelToken {
    constructor(executor) {
      if (typeof executor !== "function") {
        throw new TypeError("executor must be a function.");
      }
      let resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });
      const token = this;
      this.promise.then((cancel) => {
        if (!token._listeners) return;
        let i = token._listeners.length;
        while (i-- > 0) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });
      this.promise.then = (onfulfilled) => {
        let _resolve;
        const promise = new Promise((resolve) => {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);
        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };
        return promise;
      };
      executor(function cancel(message, config, request) {
        if (token.reason) {
          return;
        }
        token.reason = new CanceledError_default(message, config, request);
        resolvePromise(token.reason);
      });
    }
    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    }
    /**
     * Subscribe to the cancel signal
     */
    subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }
      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    }
    /**
     * Unsubscribe from the cancel signal
     */
    unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }
    toAbortSignal() {
      const controller = new AbortController();
      const abort = (err) => {
        controller.abort(err);
      };
      this.subscribe(abort);
      controller.signal.unsubscribe = () => this.unsubscribe(abort);
      return controller.signal;
    }
    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    static source() {
      let cancel;
      const token = new _CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    }
  };
  var CancelToken_default = CancelToken;

  // node_modules/axios/lib/helpers/spread.js
  function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  }

  // node_modules/axios/lib/helpers/isAxiosError.js
  function isAxiosError(payload) {
    return utils_default.isObject(payload) && payload.isAxiosError === true;
  }

  // node_modules/axios/lib/helpers/HttpStatusCode.js
  var HttpStatusCode = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
    WebServerIsDown: 521,
    ConnectionTimedOut: 522,
    OriginIsUnreachable: 523,
    TimeoutOccurred: 524,
    SslHandshakeFailed: 525,
    InvalidSslCertificate: 526
  };
  Object.entries(HttpStatusCode).forEach(([key, value]) => {
    HttpStatusCode[value] = key;
  });
  var HttpStatusCode_default = HttpStatusCode;

  // node_modules/axios/lib/axios.js
  function createInstance(defaultConfig) {
    const context = new Axios_default(defaultConfig);
    const instance = bind(Axios_default.prototype.request, context);
    utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
    utils_default.extend(instance, context, null, { allOwnKeys: true });
    instance.create = function create2(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };
    return instance;
  }
  var axios = createInstance(defaults_default);
  axios.Axios = Axios_default;
  axios.CanceledError = CanceledError_default;
  axios.CancelToken = CancelToken_default;
  axios.isCancel = isCancel;
  axios.VERSION = VERSION;
  axios.toFormData = toFormData_default;
  axios.AxiosError = AxiosError_default;
  axios.Cancel = axios.CanceledError;
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;
  axios.isAxiosError = isAxiosError;
  axios.mergeConfig = mergeConfig;
  axios.AxiosHeaders = AxiosHeaders_default;
  axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
  axios.getAdapter = adapters_default.getAdapter;
  axios.HttpStatusCode = HttpStatusCode_default;
  axios.default = axios;
  var axios_default = axios;

  // node_modules/axios/index.js
  var {
    Axios: Axios2,
    AxiosError: AxiosError2,
    CanceledError: CanceledError2,
    isCancel: isCancel2,
    CancelToken: CancelToken2,
    VERSION: VERSION2,
    all: all2,
    Cancel,
    isAxiosError: isAxiosError2,
    spread: spread2,
    toFormData: toFormData2,
    AxiosHeaders: AxiosHeaders2,
    HttpStatusCode: HttpStatusCode2,
    formToJSON,
    getAdapter: getAdapter2,
    mergeConfig: mergeConfig2
  } = axios_default;

  // resources/js/bootstrap.js
  window.axios = axios_default;
  window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

  // node_modules/preline/src/index.ts
  init_accessibility_manager();

  // node_modules/preline/src/plugins/copy-markup/index.ts
  init_utils();
  init_base_plugin();
  var HSCopyMarkup = class _HSCopyMarkup extends HSBasePlugin {
    targetSelector;
    wrapperSelector;
    limit;
    target;
    wrapper;
    items;
    onElementClickListener;
    onDeleteItemButtonClickListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-copy-markup");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.targetSelector = concatOptions?.targetSelector || null;
      this.wrapperSelector = concatOptions?.wrapperSelector || null;
      this.limit = concatOptions?.limit || null;
      this.items = [];
      if (this.targetSelector) this.init();
    }
    elementClick() {
      this.copy();
    }
    deleteItemButtonClick(item) {
      this.delete(item);
    }
    init() {
      this.createCollection(window.$hsCopyMarkupCollection, this);
      this.onElementClickListener = () => this.elementClick();
      this.setTarget();
      this.setWrapper();
      this.addPredefinedItems();
      this.el.addEventListener("click", this.onElementClickListener);
    }
    copy() {
      if (this.limit && this.items.length >= this.limit) return false;
      if (this.el.hasAttribute("disabled")) this.el.setAttribute("disabled", "");
      const copiedElement = this.target.cloneNode(true);
      this.addToItems(copiedElement);
      if (this.limit && this.items.length >= this.limit) {
        this.el.setAttribute("disabled", "disabled");
      }
      this.fireEvent("copy", copiedElement);
      dispatch("copy.hs.copyMarkup", copiedElement, copiedElement);
    }
    addPredefinedItems() {
      Array.from(this.wrapper.children).filter(
        (el) => !el.classList.contains("[--ignore-for-count]")
      ).forEach((el) => {
        this.addToItems(el);
      });
      if (this.limit && this.items.length >= this.limit) {
        this.el.setAttribute("disabled", "disabled");
      }
    }
    setTarget() {
      const target = typeof this.targetSelector === "string" ? document.querySelector(this.targetSelector).cloneNode(true) : this.targetSelector.cloneNode(true);
      target.removeAttribute("id");
      this.target = target;
    }
    setWrapper() {
      this.wrapper = typeof this.wrapperSelector === "string" ? document.querySelector(this.wrapperSelector) : this.wrapperSelector;
    }
    addToItems(item) {
      const deleteItemButton = item.querySelector(
        "[data-hs-copy-markup-delete-item]"
      );
      if (this.wrapper) this.wrapper.append(item);
      else this.el.before(item);
      if (deleteItemButton) {
        this.onDeleteItemButtonClickListener = () => this.deleteItemButtonClick(item);
        deleteItemButton.addEventListener(
          "click",
          this.onDeleteItemButtonClickListener
        );
      }
      this.items.push(item);
    }
    // Public methods
    delete(target) {
      const index = this.items.indexOf(target);
      if (index !== -1) this.items.splice(index, 1);
      target.remove();
      if (this.limit && this.items.length < this.limit) {
        this.el.removeAttribute("disabled");
      }
      this.fireEvent("delete", target);
      dispatch("delete.hs.copyMarkup", target, target);
    }
    destroy() {
      const deleteItemButtons = this.wrapper.querySelectorAll(
        "[data-hs-copy-markup-delete-item]"
      );
      this.el.removeEventListener("click", this.onElementClickListener);
      if (deleteItemButtons.length) {
        deleteItemButtons.forEach(
          (el) => el.removeEventListener("click", this.onDeleteItemButtonClickListener)
        );
      }
      this.el.removeAttribute("disabled");
      this.target = null;
      this.wrapper = null;
      this.items = null;
      window.$hsCopyMarkupCollection = window.$hsCopyMarkupCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static method
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsCopyMarkupCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsCopyMarkupCollection) window.$hsCopyMarkupCollection = [];
      if (window.$hsCopyMarkupCollection) {
        window.$hsCopyMarkupCollection = window.$hsCopyMarkupCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll("[data-hs-copy-markup]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsCopyMarkupCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          const data = el.getAttribute("data-hs-copy-markup");
          const options = data ? JSON.parse(data) : {};
          new _HSCopyMarkup(el, options);
        }
      });
    }
  };
  window.addEventListener("load", () => {
    HSCopyMarkup.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSCopyMarkup = HSCopyMarkup;
  }
  var copy_markup_default = HSCopyMarkup;

  // node_modules/preline/src/plugins/accordion/index.ts
  init_utils();
  init_base_plugin();
  var HSAccordion = class _HSAccordion extends HSBasePlugin {
    toggle;
    content;
    group;
    isAlwaysOpened;
    keepOneOpen;
    isToggleStopPropagated;
    onToggleClickListener;
    static selectable;
    constructor(el, options, events) {
      super(el, options, events);
      this.toggle = this.el.querySelector(".hs-accordion-toggle") || null;
      this.content = this.el.querySelector(".hs-accordion-content") || null;
      this.group = this.el.closest(".hs-accordion-group") || null;
      this.update();
      this.isToggleStopPropagated = stringToBoolean(
        getClassProperty(this.toggle, "--stop-propagation", "false") || "false"
      );
      this.keepOneOpen = this.group ? stringToBoolean(
        getClassProperty(this.group, "--keep-one-open", "false") || "false"
      ) : false;
      if (this.toggle && this.content) this.init();
    }
    init() {
      this.createCollection(window.$hsAccordionCollection, this);
      this.onToggleClickListener = (evt) => this.toggleClick(evt);
      this.toggle.addEventListener("click", this.onToggleClickListener);
    }
    // Public methods
    toggleClick(evt) {
      if (this.el.classList.contains("active") && this.keepOneOpen) return false;
      if (this.isToggleStopPropagated) evt.stopPropagation();
      if (this.el.classList.contains("active")) {
        this.hide();
      } else {
        this.show();
      }
    }
    show() {
      if (this.group && !this.isAlwaysOpened && this.group.querySelector(":scope > .hs-accordion.active") && this.group.querySelector(":scope > .hs-accordion.active") !== this.el) {
        const currentlyOpened = window.$hsAccordionCollection.find(
          (el) => el.element.el === this.group.querySelector(":scope > .hs-accordion.active")
        );
        currentlyOpened.element.hide();
      }
      if (this.el.classList.contains("active")) return false;
      this.el.classList.add("active");
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
      this.fireEvent("beforeOpen", this.el);
      dispatch("beforeOpen.hs.accordion", this.el, this.el);
      this.content.style.display = "block";
      this.content.style.height = "0";
      setTimeout(() => {
        this.content.style.height = `${this.content.scrollHeight}px`;
        afterTransition(this.content, () => {
          this.content.style.display = "block";
          this.content.style.height = "";
          this.fireEvent("open", this.el);
          dispatch("open.hs.accordion", this.el, this.el);
        });
      });
    }
    hide() {
      if (!this.el.classList.contains("active")) return false;
      this.el.classList.remove("active");
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
      this.fireEvent("beforeClose", this.el);
      dispatch("beforeClose.hs.accordion", this.el, this.el);
      this.content.style.height = `${this.content.scrollHeight}px`;
      setTimeout(() => {
        this.content.style.height = "0";
      });
      afterTransition(this.content, () => {
        this.content.style.display = "none";
        this.content.style.height = "";
        this.fireEvent("close", this.el);
        dispatch("close.hs.accordion", this.el, this.el);
      });
    }
    update() {
      this.group = this.el.closest(".hs-accordion-group") || null;
      if (!this.group) return false;
      this.isAlwaysOpened = this.group.hasAttribute("data-hs-accordion-always-open") || false;
      window.$hsAccordionCollection.map((el) => {
        if (el.id === this.el.id) {
          el.element.group = this.group;
          el.element.isAlwaysOpened = this.isAlwaysOpened;
        }
        return el;
      });
    }
    destroy() {
      if (_HSAccordion?.selectable?.length) {
        _HSAccordion.selectable.forEach((item) => {
          item.listeners.forEach(({ el, listener }) => {
            el.removeEventListener("click", listener);
          });
        });
      }
      if (this.onToggleClickListener) {
        this.toggle.removeEventListener("click", this.onToggleClickListener);
      }
      this.toggle = null;
      this.content = null;
      this.group = null;
      this.onToggleClickListener = null;
      window.$hsAccordionCollection = window.$hsAccordionCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static findInCollection(target) {
      return window.$hsAccordionCollection.find((el) => {
        if (target instanceof _HSAccordion) return el.element.el === target.el;
        else if (typeof target === "string") return el.element.el === document.querySelector(target);
        else return el.element.el === target;
      }) || null;
    }
    static autoInit() {
      if (!window.$hsAccordionCollection) window.$hsAccordionCollection = [];
      if (window.$hsAccordionCollection) {
        window.$hsAccordionCollection = window.$hsAccordionCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll(".hs-accordion:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsAccordionCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSAccordion(el);
      });
    }
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsAccordionCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static show(target) {
      const instance = _HSAccordion.findInCollection(target);
      if (instance && instance.element.content.style.display !== "block") instance.element.show();
    }
    static hide(target) {
      const instance = _HSAccordion.findInCollection(target);
      const style = instance ? window.getComputedStyle(instance.element.content) : null;
      if (instance && style.display !== "none") instance.element.hide();
    }
    static onSelectableClick = (evt, item, el) => {
      evt.stopPropagation();
      _HSAccordion.toggleSelected(item, el);
    };
    static treeView() {
      if (!document.querySelectorAll(".hs-accordion-treeview-root").length)
        return false;
      this.selectable = [];
      document.querySelectorAll(".hs-accordion-treeview-root").forEach((el) => {
        const data = el?.getAttribute("data-hs-accordion-options");
        const options = data ? JSON.parse(data) : {};
        this.selectable.push({
          el,
          options: { ...options },
          listeners: []
        });
      });
      if (this.selectable.length)
        this.selectable.forEach((item) => {
          const { el } = item;
          el.querySelectorAll(".hs-accordion-selectable").forEach(
            (_el) => {
              const listener = (evt) => this.onSelectableClick(evt, item, _el);
              _el.addEventListener("click", listener);
              item.listeners.push({ el: _el, listener });
            }
          );
        });
    }
    static toggleSelected(root, item) {
      if (item.classList.contains("selected")) item.classList.remove("selected");
      else {
        root.el.querySelectorAll(".hs-accordion-selectable").forEach((el) => el.classList.remove("selected"));
        item.classList.add("selected");
      }
    }
    // Backward compatibility
    static on(evt, target, cb) {
      const instance = _HSAccordion.findInCollection(target);
      if (instance) instance.element.events[evt] = cb;
    }
  };
  window.addEventListener("load", () => {
    HSAccordion.autoInit();
    if (document.querySelectorAll(".hs-accordion-treeview-root").length)
      HSAccordion.treeView();
  });
  if (typeof window !== "undefined") {
    window.HSAccordion = HSAccordion;
  }
  var accordion_default = HSAccordion;

  // node_modules/preline/src/plugins/carousel/index.ts
  init_utils();
  init_base_plugin();
  init_constants();
  var HSCarousel = class _HSCarousel extends HSBasePlugin {
    currentIndex;
    loadingClasses;
    dotsItemClasses;
    isAutoHeight;
    isAutoPlay;
    isCentered;
    isDraggable;
    isInfiniteLoop;
    isRTL;
    isSnap;
    hasSnapSpacers;
    slidesQty;
    speed;
    updateDelay;
    loadingClassesRemove;
    loadingClassesAdd;
    afterLoadingClassesAdd;
    container;
    inner;
    slides;
    prev;
    next;
    dots;
    dotsItems;
    info;
    infoTotal;
    infoCurrent;
    sliderWidth;
    timer;
    // Drag events' help variables
    isScrolling;
    isDragging;
    dragStartX;
    initialTranslateX;
    // Touch events' help variables
    touchX;
    touchY;
    // Resize events' help variables
    resizeContainer;
    resizeContainerWidth;
    // Listeners
    onPrevClickListener;
    onNextClickListener;
    onContainerScrollListener;
    onElementTouchStartListener;
    onElementTouchEndListener;
    onInnerMouseDownListener;
    onInnerTouchStartListener;
    onDocumentMouseMoveListener;
    onDocumentTouchMoveListener;
    onDocumentMouseUpListener;
    onDocumentTouchEndListener;
    onDotClickListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-carousel");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.currentIndex = concatOptions.currentIndex || 0;
      this.loadingClasses = concatOptions.loadingClasses ? `${concatOptions.loadingClasses}`.split(",") : null;
      this.dotsItemClasses = concatOptions.dotsItemClasses ? concatOptions.dotsItemClasses : null;
      this.isAutoHeight = typeof concatOptions.isAutoHeight !== "undefined" ? concatOptions.isAutoHeight : false;
      this.isAutoPlay = typeof concatOptions.isAutoPlay !== "undefined" ? concatOptions.isAutoPlay : false;
      this.isCentered = typeof concatOptions.isCentered !== "undefined" ? concatOptions.isCentered : false;
      this.isDraggable = typeof concatOptions.isDraggable !== "undefined" ? concatOptions.isDraggable : false;
      this.isInfiniteLoop = typeof concatOptions.isInfiniteLoop !== "undefined" ? concatOptions.isInfiniteLoop : false;
      this.isRTL = typeof concatOptions.isRTL !== "undefined" ? concatOptions.isRTL : false;
      this.isSnap = typeof concatOptions.isSnap !== "undefined" ? concatOptions.isSnap : false;
      this.hasSnapSpacers = typeof concatOptions.hasSnapSpacers !== "undefined" ? concatOptions.hasSnapSpacers : true;
      this.speed = concatOptions.speed || 4e3;
      this.updateDelay = concatOptions.updateDelay || 0;
      this.slidesQty = concatOptions.slidesQty || 1;
      this.loadingClassesRemove = this.loadingClasses?.[0] ? this.loadingClasses[0].split(" ") : "opacity-0";
      this.loadingClassesAdd = this.loadingClasses?.[1] ? this.loadingClasses[1].split(" ") : "";
      this.afterLoadingClassesAdd = this.loadingClasses?.[2] ? this.loadingClasses[2].split(" ") : "";
      this.container = this.el.querySelector(".hs-carousel") || null;
      this.inner = this.el.querySelector(".hs-carousel-body") || null;
      this.slides = this.el.querySelectorAll(".hs-carousel-slide") || [];
      this.prev = this.el.querySelector(".hs-carousel-prev") || null;
      this.next = this.el.querySelector(".hs-carousel-next") || null;
      this.dots = this.el.querySelector(".hs-carousel-pagination") || null;
      this.info = this.el.querySelector(".hs-carousel-info") || null;
      this.infoTotal = this?.info?.querySelector(".hs-carousel-info-total") || null;
      this.infoCurrent = this?.info?.querySelector(".hs-carousel-info-current") || null;
      this.sliderWidth = this.el.getBoundingClientRect().width;
      this.isDragging = false;
      this.dragStartX = null;
      this.initialTranslateX = null;
      this.touchX = {
        start: 0,
        end: 0
      };
      this.touchY = {
        start: 0,
        end: 0
      };
      this.resizeContainer = document.querySelector("body");
      this.resizeContainerWidth = 0;
      this.init();
    }
    setIsSnap() {
      const containerRect = this.container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      let closestElement = null;
      let closestElementIndex = null;
      let closestDistance = Infinity;
      Array.from(this.inner.children).forEach((child) => {
        const childRect = child.getBoundingClientRect();
        const innerContainerRect = this.inner.getBoundingClientRect();
        const childCenter = childRect.left + childRect.width / 2 - innerContainerRect.left;
        const distance = Math.abs(
          containerCenter - (innerContainerRect.left + childCenter)
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestElement = child;
        }
      });
      if (closestElement) {
        closestElementIndex = Array.from(this.slides).findIndex(
          (el) => el === closestElement
        );
      }
      this.setIndex(closestElementIndex);
      if (this.dots) this.setCurrentDot();
    }
    prevClick() {
      this.goToPrev();
      if (this.isAutoPlay) {
        this.resetTimer();
        this.setTimer();
      }
    }
    nextClick() {
      this.goToNext();
      if (this.isAutoPlay) {
        this.resetTimer();
        this.setTimer();
      }
    }
    containerScroll() {
      clearTimeout(this.isScrolling);
      this.isScrolling = setTimeout(() => {
        this.setIsSnap();
      }, 100);
    }
    elementTouchStart(evt) {
      this.touchX.start = evt.changedTouches[0].screenX;
      this.touchY.start = evt.changedTouches[0].screenY;
    }
    elementTouchEnd(evt) {
      this.touchX.end = evt.changedTouches[0].screenX;
      this.touchY.end = evt.changedTouches[0].screenY;
      this.detectDirection();
    }
    innerMouseDown(evt) {
      this.handleDragStart(evt);
    }
    innerTouchStart(evt) {
      this.handleDragStart(evt);
    }
    documentMouseMove(evt) {
      this.handleDragMove(evt);
    }
    documentTouchMove(evt) {
      this.handleDragMove(evt);
    }
    documentMouseUp() {
      this.handleDragEnd();
    }
    documentTouchEnd() {
      this.handleDragEnd();
    }
    dotClick(ind) {
      this.goTo(ind);
      if (this.isAutoPlay) {
        this.resetTimer();
        this.setTimer();
      }
    }
    init() {
      this.createCollection(window.$hsCarouselCollection, this);
      if (this.inner) {
        this.calculateWidth();
        if (this.isDraggable && !this.isSnap) this.initDragHandling();
      }
      if (this.prev) {
        this.onPrevClickListener = () => this.prevClick();
        this.prev.addEventListener("click", this.onPrevClickListener);
      }
      if (this.next) {
        this.onNextClickListener = () => this.nextClick();
        this.next.addEventListener("click", this.onNextClickListener);
      }
      if (this.dots) this.initDots();
      if (this.info) this.buildInfo();
      if (this.slides.length) {
        this.addCurrentClass();
        if (!this.isInfiniteLoop) this.addDisabledClass();
        if (this.isAutoPlay) this.autoPlay();
      }
      setTimeout(() => {
        if (this.isSnap) this.setIsSnap();
        if (this.loadingClassesRemove) {
          if (typeof this.loadingClassesRemove === "string") {
            this.inner.classList.remove(this.loadingClassesRemove);
          } else this.inner.classList.remove(...this.loadingClassesRemove);
        }
        if (this.loadingClassesAdd) {
          if (typeof this.loadingClassesAdd === "string") {
            this.inner.classList.add(this.loadingClassesAdd);
          } else this.inner.classList.add(...this.loadingClassesAdd);
        }
        if (this.inner && this.afterLoadingClassesAdd) {
          setTimeout(() => {
            if (typeof this.afterLoadingClassesAdd === "string") {
              this.inner.classList.add(this.afterLoadingClassesAdd);
            } else this.inner.classList.add(...this.afterLoadingClassesAdd);
          });
        }
      }, 400);
      if (this.isSnap) {
        this.onContainerScrollListener = () => this.containerScroll();
        this.container.addEventListener("scroll", this.onContainerScrollListener);
      }
      this.el.classList.add("init");
      if (!this.isSnap) {
        this.onElementTouchStartListener = (evt) => this.elementTouchStart(evt);
        this.onElementTouchEndListener = (evt) => this.elementTouchEnd(evt);
        this.el.addEventListener("touchstart", this.onElementTouchStartListener);
        this.el.addEventListener("touchend", this.onElementTouchEndListener);
      }
      this.observeResize();
    }
    initDragHandling() {
      const scrollableElement = this.inner;
      this.onInnerMouseDownListener = (evt) => this.innerMouseDown(evt);
      this.onInnerTouchStartListener = (evt) => this.innerTouchStart(evt);
      this.onDocumentMouseMoveListener = (evt) => this.documentMouseMove(evt);
      this.onDocumentTouchMoveListener = (evt) => this.documentTouchMove(evt);
      this.onDocumentMouseUpListener = () => this.documentMouseUp();
      this.onDocumentTouchEndListener = () => this.documentTouchEnd();
      if (scrollableElement) {
        scrollableElement.addEventListener(
          "mousedown",
          this.onInnerMouseDownListener
        );
        scrollableElement.addEventListener(
          "touchstart",
          this.onInnerTouchStartListener,
          { passive: true }
        );
        document.addEventListener("mousemove", this.onDocumentMouseMoveListener);
        document.addEventListener("touchmove", this.onDocumentTouchMoveListener, {
          passive: false
        });
        document.addEventListener("mouseup", this.onDocumentMouseUpListener);
        document.addEventListener("touchend", this.onDocumentTouchEndListener);
      }
    }
    getTranslateXValue() {
      const transformMatrix = window.getComputedStyle(this.inner).transform;
      if (transformMatrix !== "none") {
        const matrixValues = transformMatrix.match(/matrix.*\((.+)\)/)?.[1].split(", ");
        if (matrixValues) {
          let translateX = parseFloat(
            matrixValues.length === 6 ? matrixValues[4] : matrixValues[12]
          );
          if (this.isRTL) translateX = -translateX;
          return isNaN(translateX) || translateX === 0 ? 0 : -translateX;
        }
      }
      return 0;
    }
    removeClickEventWhileDragging(evt) {
      evt.preventDefault();
    }
    handleDragStart(evt) {
      evt.preventDefault();
      this.isDragging = true;
      this.dragStartX = this.getEventX(evt);
      this.initialTranslateX = this.isRTL ? this.getTranslateXValue() : -this.getTranslateXValue();
      this.inner.classList.add("dragging");
    }
    handleDragMove(evt) {
      if (!this.isDragging) return;
      this.inner.querySelectorAll("a:not(.prevented-click)").forEach((el) => {
        el.classList.add("prevented-click");
        el.addEventListener("click", this.removeClickEventWhileDragging);
      });
      const currentX = this.getEventX(evt);
      let deltaX = currentX - this.dragStartX;
      if (this.isRTL) deltaX = -deltaX;
      const newTranslateX = this.initialTranslateX + deltaX;
      const newTranslateXFunc = () => {
        let calcWidth = this.sliderWidth * this.slides.length / this.getCurrentSlidesQty() - this.sliderWidth;
        const containerWidth = this.sliderWidth;
        const itemWidth = containerWidth / this.getCurrentSlidesQty();
        const centeredOffset = (containerWidth - itemWidth) / 2;
        const limitStart = this.isCentered ? centeredOffset : 0;
        if (this.isCentered) calcWidth = calcWidth + centeredOffset;
        const limitEnd = -calcWidth;
        if (this.isRTL) {
          if (newTranslateX < limitStart) return limitStart;
          if (newTranslateX > calcWidth) return limitEnd;
          else return -newTranslateX;
        } else {
          if (newTranslateX > limitStart) return limitStart;
          else if (newTranslateX < -calcWidth) return limitEnd;
          else return newTranslateX;
        }
      };
      this.setTranslate(newTranslateXFunc());
    }
    handleDragEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;
      const containerWidth = this.sliderWidth;
      const itemWidth = containerWidth / this.getCurrentSlidesQty();
      const currentTranslateX = this.getTranslateXValue();
      let closestIndex = Math.round(currentTranslateX / itemWidth);
      if (this.isRTL) closestIndex = Math.round(currentTranslateX / itemWidth);
      this.inner.classList.remove("dragging");
      setTimeout(() => {
        this.calculateTransform(closestIndex);
        if (this.dots) this.setCurrentDot();
        this.dragStartX = null;
        this.initialTranslateX = null;
        this.inner.querySelectorAll("a.prevented-click").forEach((el) => {
          el.classList.remove("prevented-click");
          el.removeEventListener("click", this.removeClickEventWhileDragging);
        });
      });
    }
    getEventX(event) {
      return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    }
    getCurrentSlidesQty() {
      if (typeof this.slidesQty === "object") {
        const windowWidth = document.body.clientWidth;
        let currentRes = 0;
        Object.keys(this.slidesQty).forEach((key) => {
          if (windowWidth >= (typeof key + 1 === "number" ? this.slidesQty[key] : BREAKPOINTS[key])) {
            currentRes = this.slidesQty[key];
          }
        });
        return currentRes;
      } else {
        return this.slidesQty;
      }
    }
    buildSnapSpacers() {
      const existingBefore = this.inner.querySelector(".hs-snap-before");
      const existingAfter = this.inner.querySelector(".hs-snap-after");
      if (existingBefore) existingBefore.remove();
      if (existingAfter) existingAfter.remove();
      const containerWidth = this.sliderWidth;
      const itemWidth = containerWidth / this.getCurrentSlidesQty();
      const spacerWidth = containerWidth / 2 - itemWidth / 2;
      const before = htmlToElement(
        `<div class="hs-snap-before" style="height: 100%; width: ${spacerWidth}px"></div>`
      );
      const after = htmlToElement(
        `<div class="hs-snap-after" style="height: 100%; width: ${spacerWidth}px"></div>`
      );
      this.inner.prepend(before);
      this.inner.appendChild(after);
    }
    initDots() {
      if (this.el.querySelectorAll(".hs-carousel-pagination-item").length) {
        this.setDots();
      } else this.buildDots();
      if (this.dots) this.setCurrentDot();
    }
    buildDots() {
      this.dots.innerHTML = "";
      const slidesQty = !this.isCentered && this.slidesQty ? this.slides.length - (this.getCurrentSlidesQty() - 1) : this.slides.length;
      for (let i = 0; i < slidesQty; i++) {
        const singleDot = this.buildSingleDot(i);
        this.dots.append(singleDot);
      }
    }
    setDots() {
      this.dotsItems = this.dots.querySelectorAll(".hs-carousel-pagination-item");
      this.dotsItems.forEach((dot, ind) => {
        const targetIndex = dot.getAttribute(
          "data-carousel-pagination-item-target"
        );
        this.singleDotEvents(dot, targetIndex ? +targetIndex : ind);
      });
    }
    goToCurrentDot() {
      const container = this.dots;
      const containerRect = container.getBoundingClientRect();
      const containerScrollLeft = container.scrollLeft;
      const containerScrollTop = container.scrollTop;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const item = this.dotsItems[this.currentIndex];
      const itemRect = item.getBoundingClientRect();
      const itemLeft = itemRect.left - containerRect.left + containerScrollLeft;
      const itemRight = itemLeft + item.clientWidth;
      const itemTop = itemRect.top - containerRect.top + containerScrollTop;
      const itemBottom = itemTop + item.clientHeight;
      let scrollLeft = containerScrollLeft;
      let scrollTop = containerScrollTop;
      if (itemLeft < containerScrollLeft || itemRight > containerScrollLeft + containerWidth) {
        scrollLeft = itemRight - containerWidth;
      }
      if (itemTop < containerScrollTop || itemBottom > containerScrollTop + containerHeight) {
        scrollTop = itemBottom - containerHeight;
      }
      container.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: "smooth"
      });
    }
    buildInfo() {
      if (this.infoTotal) this.setInfoTotal();
      if (this.infoCurrent) this.setInfoCurrent();
    }
    setInfoTotal() {
      this.infoTotal.innerText = `${this.slides.length}`;
    }
    setInfoCurrent() {
      this.infoCurrent.innerText = `${this.currentIndex + 1}`;
    }
    buildSingleDot(ind) {
      const singleDot = htmlToElement("<span></span>");
      if (this.dotsItemClasses) classToClassList(this.dotsItemClasses, singleDot);
      this.singleDotEvents(singleDot, ind);
      return singleDot;
    }
    singleDotEvents(dot, ind) {
      this.onDotClickListener = () => this.dotClick(ind);
      dot.addEventListener("click", this.onDotClickListener);
    }
    observeResize() {
      const resizeObserver = new ResizeObserver(
        debounce((entries) => {
          for (let entry of entries) {
            const newWidth = entry.contentRect.width;
            if (newWidth !== this.resizeContainerWidth) {
              this.recalculateWidth();
              if (this.dots) this.initDots();
              this.addCurrentClass();
              this.resizeContainerWidth = newWidth;
            }
          }
        }, this.updateDelay)
      );
      resizeObserver.observe(this.resizeContainer);
    }
    calculateWidth() {
      if (!this.isSnap) {
        this.inner.style.width = `${this.sliderWidth * this.slides.length / this.getCurrentSlidesQty()}px`;
      }
      this.slides.forEach((el) => {
        el.style.width = `${this.sliderWidth / this.getCurrentSlidesQty()}px`;
      });
      this.calculateTransform();
    }
    addCurrentClass() {
      if (this.isSnap) {
        const itemsQty = Math.floor(this.getCurrentSlidesQty() / 2);
        for (let i = 0; i < this.slides.length; i++) {
          const slide = this.slides[i];
          if (i <= this.currentIndex + itemsQty && i >= this.currentIndex - itemsQty) {
            slide.classList.add("active");
          } else slide.classList.remove("active");
        }
      } else {
        const maxIndex = this.isCentered ? this.currentIndex + this.getCurrentSlidesQty() + (this.getCurrentSlidesQty() - 1) : this.currentIndex + this.getCurrentSlidesQty();
        this.slides.forEach((el, i) => {
          if (i >= this.currentIndex && i < maxIndex) {
            el.classList.add("active");
          } else {
            el.classList.remove("active");
          }
        });
      }
    }
    setCurrentDot() {
      const toggleDotActive = (el, i) => {
        let statement = false;
        const itemsQty = Math.floor(this.getCurrentSlidesQty() / 2);
        if (this.isSnap && !this.hasSnapSpacers) {
          statement = i === (this.getCurrentSlidesQty() % 2 === 0 ? this.currentIndex - itemsQty + 1 : this.currentIndex - itemsQty);
        } else statement = i === this.currentIndex;
        if (statement) el.classList.add("active");
        else el.classList.remove("active");
      };
      if (this.dotsItems) {
        this.dotsItems.forEach((el, i) => toggleDotActive(el, i));
      } else {
        this.dots.querySelectorAll(":scope > *").forEach((el, i) => toggleDotActive(el, i));
      }
    }
    setElementToDisabled(el) {
      el.classList.add("disabled");
      if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
        el.setAttribute("disabled", "disabled");
      }
    }
    unsetElementToDisabled(el) {
      el.classList.remove("disabled");
      if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
        el.removeAttribute("disabled");
      }
    }
    addDisabledClass() {
      if (!this.prev || !this.next) return false;
      const gapValue = getComputedStyle(this.inner).getPropertyValue("gap");
      const itemsQty = Math.floor(this.getCurrentSlidesQty() / 2);
      let currentIndex = 0;
      let maxIndex = 0;
      let statementPrev = false;
      let statementNext = false;
      if (this.isSnap) {
        currentIndex = this.currentIndex;
        maxIndex = this.hasSnapSpacers ? this.slides.length - 1 : this.slides.length - itemsQty - 1;
        statementPrev = this.hasSnapSpacers ? currentIndex === 0 : this.getCurrentSlidesQty() % 2 === 0 ? currentIndex - itemsQty < 0 : currentIndex - itemsQty === 0;
        statementNext = currentIndex >= maxIndex && this.container.scrollLeft + this.container.clientWidth + (parseFloat(gapValue) || 0) >= this.container.scrollWidth;
      } else {
        currentIndex = this.currentIndex;
        maxIndex = this.isCentered ? this.slides.length - this.getCurrentSlidesQty() + (this.getCurrentSlidesQty() - 1) : this.slides.length - this.getCurrentSlidesQty();
        statementPrev = currentIndex === 0;
        statementNext = currentIndex >= maxIndex;
      }
      if (statementPrev) {
        this.unsetElementToDisabled(this.next);
        this.setElementToDisabled(this.prev);
      } else if (statementNext) {
        this.unsetElementToDisabled(this.prev);
        this.setElementToDisabled(this.next);
      } else {
        this.unsetElementToDisabled(this.prev);
        this.unsetElementToDisabled(this.next);
      }
    }
    autoPlay() {
      this.setTimer();
    }
    setTimer() {
      this.timer = setInterval(() => {
        if (this.currentIndex === this.slides.length - 1) this.goTo(0);
        else this.goToNext();
      }, this.speed);
    }
    resetTimer() {
      clearInterval(this.timer);
    }
    detectDirection() {
      const deltaX = this.touchX.end - this.touchX.start;
      const deltaY = this.touchY.end - this.touchY.start;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const SWIPE_THRESHOLD = 30;
      if (absDeltaX < SWIPE_THRESHOLD || absDeltaX < absDeltaY) return;
      const isSwipeToNext = this.isRTL ? deltaX > 0 : deltaX < 0;
      if (!this.isInfiniteLoop) {
        if (isSwipeToNext && this.currentIndex < this.slides.length - this.getCurrentSlidesQty()) {
          this.goToNext();
        }
        if (!isSwipeToNext && this.currentIndex > 0) {
          this.goToPrev();
        }
      } else {
        if (isSwipeToNext) this.goToNext();
        else this.goToPrev();
      }
    }
    calculateTransform(currentIdx) {
      if (currentIdx !== void 0) this.currentIndex = currentIdx;
      const containerWidth = this.sliderWidth;
      const itemWidth = containerWidth / this.getCurrentSlidesQty();
      let translateX = this.currentIndex * itemWidth;
      if (this.isSnap && !this.isCentered) {
        if (this.container.scrollLeft < containerWidth && this.container.scrollLeft + itemWidth / 2 > containerWidth) {
          this.container.scrollLeft = this.container.scrollWidth;
        }
      }
      if (this.isCentered && !this.isSnap) {
        const centeredOffset = (containerWidth - itemWidth) / 2;
        if (this.currentIndex === 0) translateX = -centeredOffset;
        else if (this.currentIndex >= this.slides.length - this.getCurrentSlidesQty() + (this.getCurrentSlidesQty() - 1)) {
          const totalSlideWidth = this.slides.length * itemWidth;
          translateX = totalSlideWidth - containerWidth + centeredOffset;
        } else translateX = this.currentIndex * itemWidth - centeredOffset;
      }
      if (!this.isSnap) this.setTransform(translateX);
      if (this.isAutoHeight) {
        this.inner.style.height = `${this.slides[this.currentIndex].clientHeight}px`;
      }
      if (this.dotsItems) this.goToCurrentDot();
      this.addCurrentClass();
      if (!this.isInfiniteLoop) this.addDisabledClass();
      if (this.isSnap && this.hasSnapSpacers) this.buildSnapSpacers();
      if (this.infoCurrent) this.setInfoCurrent();
    }
    setTransform(val) {
      if (this.slides.length > this.getCurrentSlidesQty()) {
        this.inner.style.transform = this.isRTL ? `translate(${val}px, 0px)` : `translate(${-val}px, 0px)`;
      } else this.inner.style.transform = "translate(0px, 0px)";
    }
    setTranslate(val) {
      this.inner.style.transform = this.isRTL ? `translate(${-val}px, 0px)` : `translate(${val}px, 0px)`;
    }
    setIndex(i) {
      this.currentIndex = i;
      this.addCurrentClass();
      if (!this.isInfiniteLoop) this.addDisabledClass();
    }
    // Public methods
    recalculateWidth() {
      this.sliderWidth = this.inner.parentElement.getBoundingClientRect().width;
      this.calculateWidth();
      if (this.sliderWidth !== this.inner.parentElement.getBoundingClientRect().width) {
        this.recalculateWidth();
      }
    }
    goToPrev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        this.currentIndex = this.slides.length - this.getCurrentSlidesQty();
      }
      this.fireEvent("update", this.currentIndex);
      if (this.isSnap) {
        const itemWidth = this.sliderWidth / this.getCurrentSlidesQty();
        this.container.scrollBy({
          left: Math.max(-this.container.scrollLeft, -itemWidth),
          behavior: "smooth"
        });
        this.addCurrentClass();
        if (!this.isInfiniteLoop) this.addDisabledClass();
      } else this.calculateTransform();
      if (this.dots) this.setCurrentDot();
    }
    goToNext() {
      const statement = this.isCentered ? this.slides.length - this.getCurrentSlidesQty() + (this.getCurrentSlidesQty() - 1) : this.slides.length - this.getCurrentSlidesQty();
      if (this.currentIndex < statement) {
        this.currentIndex++;
      } else {
        this.currentIndex = 0;
      }
      this.fireEvent("update", this.currentIndex);
      if (this.isSnap) {
        const itemWidth = this.sliderWidth / this.getCurrentSlidesQty();
        const maxScrollLeft = this.container.scrollWidth - this.container.clientWidth;
        this.container.scrollBy({
          left: Math.min(itemWidth, maxScrollLeft - this.container.scrollLeft),
          behavior: "smooth"
        });
        this.addCurrentClass();
        if (!this.isInfiniteLoop) this.addDisabledClass();
      } else this.calculateTransform();
      if (this.dots) this.setCurrentDot();
    }
    goTo(i) {
      const currentIndex = this.currentIndex;
      this.currentIndex = i;
      this.fireEvent("update", this.currentIndex);
      if (this.isSnap) {
        const itemWidth = this.sliderWidth / this.getCurrentSlidesQty();
        const index = currentIndex > this.currentIndex ? currentIndex - this.currentIndex : this.currentIndex - currentIndex;
        const width = currentIndex > this.currentIndex ? -(itemWidth * index) : itemWidth * index;
        this.container.scrollBy({
          left: width,
          behavior: "smooth"
        });
        this.addCurrentClass();
        if (!this.isInfiniteLoop) this.addDisabledClass();
      } else this.calculateTransform();
      if (this.dots) this.setCurrentDot();
    }
    destroy() {
      if (this.loadingClassesAdd) {
        if (typeof this.loadingClassesAdd === "string") {
          this.inner.classList.remove(this.loadingClassesAdd);
        } else this.inner.classList.remove(...this.loadingClassesAdd);
      }
      if (this.inner && this.afterLoadingClassesAdd) {
        setTimeout(() => {
          if (typeof this.afterLoadingClassesAdd === "string") {
            this.inner.classList.remove(this.afterLoadingClassesAdd);
          } else this.inner.classList.remove(...this.afterLoadingClassesAdd);
        });
      }
      this.el.classList.remove("init");
      this.inner.classList.remove("dragging");
      this.slides.forEach((el) => el.classList.remove("active"));
      if (this?.dotsItems?.length) {
        this.dotsItems.forEach((el) => el.classList.remove("active"));
      }
      this.prev.classList.remove("disabled");
      this.next.classList.remove("disabled");
      this.inner.style.width = "";
      this.slides.forEach((el) => el.style.width = "");
      if (!this.isSnap) this.inner.style.transform = "";
      if (this.isAutoHeight) this.inner.style.height = "";
      this.prev.removeEventListener("click", this.onPrevClickListener);
      this.next.removeEventListener("click", this.onNextClickListener);
      this.container.removeEventListener(
        "scroll",
        this.onContainerScrollListener
      );
      this.el.removeEventListener("touchstart", this.onElementTouchStartListener);
      this.el.removeEventListener("touchend", this.onElementTouchEndListener);
      this.inner.removeEventListener("mousedown", this.onInnerMouseDownListener);
      this.inner.removeEventListener(
        "touchstart",
        this.onInnerTouchStartListener
      );
      document.removeEventListener("mousemove", this.onDocumentMouseMoveListener);
      document.removeEventListener("touchmove", this.onDocumentTouchMoveListener);
      document.removeEventListener("mouseup", this.onDocumentMouseUpListener);
      document.removeEventListener("touchend", this.onDocumentTouchEndListener);
      this.inner.querySelectorAll("a:not(.prevented-click)").forEach((el) => {
        el.classList.remove("prevented-click");
        el.removeEventListener("click", this.removeClickEventWhileDragging);
      });
      if (this?.dotsItems?.length || this.dots.querySelectorAll(":scope > *").length) {
        const dots = this?.dotsItems || this.dots.querySelectorAll(":scope > *");
        dots.forEach(
          (el) => el.removeEventListener("click", this.onDotClickListener)
        );
        this.dots.innerHTML = null;
      }
      this.inner.querySelector(".hs-snap-before").remove();
      this.inner.querySelector(".hs-snap-after").remove();
      this.dotsItems = null;
      this.isDragging = false;
      this.dragStartX = null;
      this.initialTranslateX = null;
      window.$hsCarouselCollection = window.$hsCarouselCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsCarouselCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsCarouselCollection) window.$hsCarouselCollection = [];
      if (window.$hsCarouselCollection) {
        window.$hsCarouselCollection = window.$hsCarouselCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll("[data-hs-carousel]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsCarouselCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          new _HSCarousel(el);
        }
      });
    }
  };
  window.addEventListener("load", () => {
    HSCarousel.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSCarousel = HSCarousel;
  }
  var carousel_default = HSCarousel;

  // node_modules/preline/src/plugins/collapse/index.ts
  init_utils();
  init_base_plugin();
  var HSCollapse = class _HSCollapse extends HSBasePlugin {
    contentId;
    content;
    animationInProcess;
    onElementClickListener;
    constructor(el, options, events) {
      super(el, options, events);
      this.contentId = this.el.dataset.hsCollapse;
      this.content = document.querySelector(this.contentId);
      this.animationInProcess = false;
      if (this.content) this.init();
    }
    elementClick() {
      if (this.content.classList.contains("open")) {
        this.hide();
      } else {
        this.show();
      }
    }
    init() {
      this.createCollection(window.$hsCollapseCollection, this);
      this.onElementClickListener = () => this.elementClick();
      if (this?.el?.ariaExpanded) {
        if (this.el.classList.contains("open")) this.el.ariaExpanded = "true";
        else this.el.ariaExpanded = "false";
      }
      this.el.addEventListener("click", this.onElementClickListener);
    }
    hideAllMegaMenuItems() {
      this.content.querySelectorAll(".hs-mega-menu-content.block").forEach((el) => {
        el.classList.remove("block");
        el.classList.add("hidden");
      });
    }
    // Public methods
    show() {
      if (this.animationInProcess || this.el.classList.contains("open"))
        return false;
      this.animationInProcess = true;
      this.el.classList.add("open");
      if (this?.el?.ariaExpanded) this.el.ariaExpanded = "true";
      this.content.classList.add("open");
      this.content.classList.remove("hidden");
      this.content.style.height = "0";
      setTimeout(() => {
        this.content.style.height = `${this.content.scrollHeight}px`;
        this.fireEvent("beforeOpen", this.el);
        dispatch("beforeOpen.hs.collapse", this.el, this.el);
      });
      afterTransition(this.content, () => {
        this.content.style.height = "";
        this.fireEvent("open", this.el);
        dispatch("open.hs.collapse", this.el, this.el);
        this.animationInProcess = false;
      });
    }
    hide() {
      if (this.animationInProcess || !this.el.classList.contains("open"))
        return false;
      this.animationInProcess = true;
      this.el.classList.remove("open");
      if (this?.el?.ariaExpanded) this.el.ariaExpanded = "false";
      this.content.style.height = `${this.content.scrollHeight}px`;
      setTimeout(() => {
        this.content.style.height = "0";
      });
      this.content.classList.remove("open");
      afterTransition(this.content, () => {
        this.content.classList.add("hidden");
        this.content.style.height = "";
        this.fireEvent("hide", this.el);
        dispatch("hide.hs.collapse", this.el, this.el);
        this.animationInProcess = false;
      });
      if (this.content.querySelectorAll(".hs-mega-menu-content.block").length) {
        this.hideAllMegaMenuItems();
      }
    }
    destroy() {
      this.el.removeEventListener("click", this.onElementClickListener);
      this.content = null;
      this.animationInProcess = false;
      window.$hsCollapseCollection = window.$hsCollapseCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static findInCollection(target) {
      return window.$hsCollapseCollection.find((el) => {
        if (target instanceof _HSCollapse) return el.element.el === target.el;
        else if (typeof target === "string") return el.element.el === document.querySelector(target);
        else return el.element.el === target;
      }) || null;
    }
    static getInstance(target, isInstance = false) {
      const elInCollection = window.$hsCollapseCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsCollapseCollection) window.$hsCollapseCollection = [];
      if (window.$hsCollapseCollection)
        window.$hsCollapseCollection = window.$hsCollapseCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll(".hs-collapse-toggle:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsCollapseCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSCollapse(el);
      });
    }
    static show(target) {
      const instance = _HSCollapse.findInCollection(target);
      if (instance && instance.element.content.classList.contains("hidden")) instance.element.show();
    }
    static hide(target) {
      const instance = _HSCollapse.findInCollection(target);
      if (instance && !instance.element.content.classList.contains("hidden")) instance.element.hide();
    }
    // Backward compatibility
    static on(evt, target, cb) {
      const instance = _HSCollapse.findInCollection(target);
      if (instance) instance.element.events[evt] = cb;
    }
  };
  window.addEventListener("load", () => {
    HSCollapse.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSCollapse = HSCollapse;
  }
  var collapse_default = HSCollapse;

  // node_modules/preline/src/plugins/combobox/index.ts
  init_utils();
  init_base_plugin();
  init_accessibility_manager();
  var HSComboBox = class _HSComboBox extends HSBasePlugin {
    gap;
    viewport;
    preventVisibility;
    minSearchLength;
    apiUrl;
    apiDataPart;
    apiQuery;
    apiSearchQuery;
    apiSearchPath;
    apiSearchDefaultPath;
    apiHeaders;
    apiGroupField;
    outputItemTemplate;
    outputEmptyTemplate;
    outputLoaderTemplate;
    groupingType;
    groupingTitleTemplate;
    tabsWrapperTemplate;
    preventSelection;
    preventAutoPosition;
    preventClientFiltering;
    isOpenOnFocus;
    keepOriginalOrder;
    preserveSelectionOnEmpty;
    accessibilityComponent;
    input;
    output;
    itemsWrapper;
    items;
    tabs;
    toggle;
    toggleClose;
    toggleOpen;
    outputPlaceholder;
    outputLoader;
    value;
    selected;
    currentData;
    groups;
    selectedGroup;
    isOpened;
    isCurrent;
    animationInProcess;
    isSearchLengthExceeded = false;
    onInputFocusListener;
    onInputInputListener;
    onToggleClickListener;
    onToggleCloseClickListener;
    onToggleOpenClickListener;
    constructor(el, options, events) {
      super(el, options, events);
      const data = el.getAttribute("data-hs-combo-box");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.gap = 5;
      this.viewport = (typeof concatOptions?.viewport === "string" ? document.querySelector(concatOptions?.viewport) : concatOptions?.viewport) ?? null;
      this.preventVisibility = concatOptions?.preventVisibility ?? false;
      this.minSearchLength = concatOptions?.minSearchLength ?? 0;
      this.apiUrl = concatOptions?.apiUrl ?? null;
      this.apiDataPart = concatOptions?.apiDataPart ?? null;
      this.apiQuery = concatOptions?.apiQuery ?? null;
      this.apiSearchQuery = concatOptions?.apiSearchQuery ?? null;
      this.apiSearchPath = concatOptions?.apiSearchPath ?? null;
      this.apiSearchDefaultPath = concatOptions?.apiSearchDefaultPath ?? null;
      this.apiHeaders = concatOptions?.apiHeaders ?? {};
      this.apiGroupField = concatOptions?.apiGroupField ?? null;
      this.outputItemTemplate = concatOptions?.outputItemTemplate ?? `<div class="cursor-pointer py-2 px-4 w-full text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" data-hs-combo-box-output-item>
				<div class="flex justify-between items-center w-full">
					<span data-hs-combo-box-search-text></span>
					<span class="hidden hs-combo-box-selected:block">
						<svg class="shrink-0 size-3.5 text-blue-600 dark:text-blue-500" xmlns="http:.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</span>
				</div>
			</div>`;
      this.outputEmptyTemplate = concatOptions?.outputEmptyTemplate ?? `<div class="py-2 px-4 w-full text-sm text-gray-800 rounded-lg dark:bg-neutral-900 dark:text-neutral-200">Nothing found...</div>`;
      this.outputLoaderTemplate = concatOptions?.outputLoaderTemplate ?? `<div class="flex justify-center items-center py-2 px-4 text-sm text-gray-800 rounded-lg bg-white dark:bg-neutral-900 dark:text-neutral-200">
				<div class="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
					<span class="sr-only">Loading...</span>
				</div>
			</div>`;
      this.groupingType = concatOptions?.groupingType ?? null;
      this.groupingTitleTemplate = concatOptions?.groupingTitleTemplate ?? (this.groupingType === "default" ? `<div class="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-500"></div>` : `<button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold whitespace-nowrap rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"></button>`);
      this.tabsWrapperTemplate = concatOptions?.tabsWrapperTemplate ?? `<div class="overflow-x-auto p-4"></div>`;
      this.preventSelection = concatOptions?.preventSelection ?? false;
      this.preventAutoPosition = concatOptions?.preventAutoPosition ?? false;
      this.preventClientFiltering = options?.preventClientFiltering ?? (!!concatOptions?.apiSearchQuery || !!concatOptions?.apiSearchPath);
      this.isOpenOnFocus = concatOptions?.isOpenOnFocus ?? false;
      this.keepOriginalOrder = concatOptions?.keepOriginalOrder ?? false;
      this.preserveSelectionOnEmpty = concatOptions?.preserveSelectionOnEmpty ?? true;
      this.input = this.el.querySelector("[data-hs-combo-box-input]") ?? null;
      this.output = this.el.querySelector("[data-hs-combo-box-output]") ?? null;
      this.itemsWrapper = this.el.querySelector("[data-hs-combo-box-output-items-wrapper]") ?? null;
      this.items = Array.from(this.el.querySelectorAll("[data-hs-combo-box-output-item]")) ?? [];
      this.tabs = [];
      this.toggle = this.el.querySelector("[data-hs-combo-box-toggle]") ?? null;
      this.toggleClose = this.el.querySelector("[data-hs-combo-box-close]") ?? null;
      this.toggleOpen = this.el.querySelector("[data-hs-combo-box-open]") ?? null;
      this.outputPlaceholder = null;
      this.selected = this.value = this.el.querySelector("[data-hs-combo-box-input]").value ?? "";
      this.currentData = null;
      this.isOpened = false;
      this.isCurrent = false;
      this.animationInProcess = false;
      this.selectedGroup = "all";
      this.init();
    }
    inputFocus() {
      if (!this.isOpened) {
        this.setResultAndRender();
        this.open();
      }
    }
    inputInput(evt) {
      const val = evt.target.value.trim();
      if (val.length <= this.minSearchLength) this.setResultAndRender("");
      else this.setResultAndRender(val);
      if (!this.preserveSelectionOnEmpty && val === "") {
        this.selected = "";
        this.value = "";
        this.currentData = null;
      }
      if (this.input.value !== "") this.el.classList.add("has-value");
      else this.el.classList.remove("has-value");
      if (!this.isOpened) this.open();
    }
    toggleClick() {
      if (this.isOpened) this.close();
      else this.open(this.toggle.getAttribute("data-hs-combo-box-toggle"));
    }
    toggleCloseClick() {
      this.close();
    }
    toggleOpenClick() {
      this.open();
    }
    init() {
      this.createCollection(window.$hsComboBoxCollection, this);
      this.build();
      if (typeof window !== "undefined") {
        if (!window.HSAccessibilityObserver) {
          window.HSAccessibilityObserver = new accessibility_manager_default();
        }
        this.setupAccessibility();
      }
    }
    build() {
      this.buildInput();
      if (this.groupingType) this.setGroups();
      this.buildItems();
      if (this.preventVisibility) {
        if (!this.preventAutoPosition) this.recalculateDirection();
      }
      if (this.toggle) this.buildToggle();
      if (this.toggleClose) this.buildToggleClose();
      if (this.toggleOpen) this.buildToggleOpen();
    }
    getNestedProperty(obj, path) {
      return path.split(".").reduce(
        (acc, key) => acc && acc[key],
        obj
      );
    }
    setValue(val, data = null) {
      this.selected = val;
      this.value = val;
      this.input.value = val;
      if (data) this.currentData = data;
      this.fireEvent("select", this.currentData);
      dispatch("select.hs.combobox", this.el, this.currentData);
    }
    setValueAndOpen(val) {
      this.value = val;
      if (this.items.length) {
        this.setItemsVisibility();
      }
    }
    setValueAndClear(val, data = null) {
      if (val) this.setValue(val, data);
      else this.setValue(this.selected, data);
      if (this.outputPlaceholder) this.destroyOutputPlaceholder();
    }
    setSelectedByValue(val) {
      this.items.forEach((el) => {
        const valueElement = el.querySelector("[data-hs-combo-box-value]");
        if (valueElement && val.includes(valueElement.textContent)) {
          el.classList.add("selected");
        } else {
          el.classList.remove("selected");
        }
      });
    }
    setResultAndRender(value = "") {
      let _value = this.preventVisibility ? this.input.value : value;
      this.setResults(_value);
      if (this.apiSearchQuery || this.apiSearchPath || this.apiSearchDefaultPath) this.itemsFromJson();
      if (_value === "") this.isSearchLengthExceeded = true;
      else this.isSearchLengthExceeded = false;
      this.updatePlaceholderVisibility();
    }
    setResults(val) {
      this.value = val;
      this.resultItems();
      this.updatePlaceholderVisibility();
    }
    updatePlaceholderVisibility() {
      if (this.hasVisibleItems()) this.destroyOutputPlaceholder();
      else this.buildOutputPlaceholder();
    }
    setGroups() {
      const groups = [];
      this.items.forEach((item) => {
        const { group } = JSON.parse(
          item.getAttribute("data-hs-combo-box-output-item")
        );
        if (!groups.some((el) => el?.name === group.name)) {
          groups.push(group);
        }
      });
      this.groups = groups;
    }
    setApiGroups(items) {
      const groups = [];
      items.forEach((item) => {
        const group = item[this.apiGroupField];
        if (!groups.some((el) => el.name === group)) {
          groups.push({
            name: group,
            title: group
          });
        }
      });
      this.groups = groups;
    }
    setItemsVisibility() {
      if (this.preventClientFiltering) {
        this.items.forEach((el) => {
          el.style.display = "";
        });
        return false;
      }
      if (this.groupingType === "tabs" && this.selectedGroup !== "all") {
        this.items.forEach((item) => {
          item.style.display = "none";
        });
      }
      const items = this.groupingType === "tabs" ? this.selectedGroup === "all" ? this.items : this.items.filter((f) => {
        const { group } = JSON.parse(
          f.getAttribute("data-hs-combo-box-output-item")
        );
        return group.name === this.selectedGroup;
      }) : this.items;
      if (this.groupingType === "tabs" && this.selectedGroup !== "all") {
        items.forEach((item) => {
          item.style.display = "block";
        });
      }
      items.forEach((item) => {
        if (!this.isTextExistsAny(item, this.value)) {
          item.style.display = "none";
        } else item.style.display = "block";
      });
      if (this.groupingType === "default") {
        this.output.querySelectorAll("[data-hs-combo-box-group-title]").forEach((el) => {
          const g = el.getAttribute("data-hs-combo-box-group-title");
          const items2 = this.items.filter((f) => {
            const { group } = JSON.parse(
              f.getAttribute("data-hs-combo-box-output-item")
            );
            return group.name === g && f.style.display === "block";
          });
          if (items2.length) el.style.display = "block";
          else el.style.display = "none";
        });
      }
    }
    isTextExistsAny(el, val) {
      return Array.from(
        el.querySelectorAll("[data-hs-combo-box-search-text]")
      ).some(
        (elI) => elI.getAttribute("data-hs-combo-box-search-text").toLowerCase().includes(val.toLowerCase())
      );
    }
    hasVisibleItems() {
      if (!this.items.length) return false;
      return this.items.some((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });
    }
    valuesBySelector(el) {
      return Array.from(
        el.querySelectorAll("[data-hs-combo-box-search-text]")
      ).reduce(
        (acc, cur) => [
          ...acc,
          cur.getAttribute("data-hs-combo-box-search-text")
        ],
        []
      );
    }
    sortItems() {
      if (this.keepOriginalOrder) return this.items;
      const compareFn = (i1, i2) => {
        const a = i1.querySelector("[data-hs-combo-box-value]").textContent;
        const b = i2.querySelector("[data-hs-combo-box-value]").textContent;
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        }
        return 0;
      };
      return this.items.sort(compareFn);
    }
    buildInput() {
      if (this.isOpenOnFocus) {
        this.onInputFocusListener = () => this.inputFocus();
        this.input.addEventListener("focus", this.onInputFocusListener);
      }
      this.onInputInputListener = debounce(
        (evt) => this.inputInput(evt)
      );
      this.input.addEventListener("input", this.onInputInputListener);
    }
    async buildItems() {
      this.output.role = "listbox";
      this.output.tabIndex = -1;
      this.output.ariaOrientation = "vertical";
      if (this.apiUrl) await this.itemsFromJson();
      else {
        if (this.itemsWrapper) this.itemsWrapper.innerHTML = "";
        else this.output.innerHTML = "";
        this.itemsFromHtml();
      }
      if (this?.items.length && this.items[0].classList.contains("selected")) {
        this.currentData = JSON.parse(
          this.items[0].getAttribute("data-hs-combo-box-item-stored-data")
        );
      }
    }
    buildOutputLoader() {
      if (this.outputLoader) return false;
      this.outputLoader = htmlToElement(this.outputLoaderTemplate);
      if (this.items.length || this.outputPlaceholder) {
        this.outputLoader.style.position = "absolute";
        this.outputLoader.style.top = "0";
        this.outputLoader.style.bottom = "0";
        this.outputLoader.style.left = "0";
        this.outputLoader.style.right = "0";
        this.outputLoader.style.zIndex = "2";
      } else {
        this.outputLoader.style.position = "";
        this.outputLoader.style.top = "";
        this.outputLoader.style.bottom = "";
        this.outputLoader.style.left = "";
        this.outputLoader.style.right = "";
        this.outputLoader.style.zIndex = "";
        this.outputLoader.style.height = "30px";
      }
      this.output.append(this.outputLoader);
    }
    buildToggle() {
      if (this.isOpened) {
        if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
        if (this?.input?.ariaExpanded) this.input.ariaExpanded = "true";
      } else {
        if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
        if (this?.input?.ariaExpanded) this.input.ariaExpanded = "false";
      }
      this.onToggleClickListener = () => this.toggleClick();
      this.toggle.addEventListener("click", this.onToggleClickListener);
    }
    buildToggleClose() {
      this.onToggleCloseClickListener = () => this.toggleCloseClick();
      this.toggleClose.addEventListener("click", this.onToggleCloseClickListener);
    }
    buildToggleOpen() {
      this.onToggleOpenClickListener = () => this.toggleOpenClick();
      this.toggleOpen.addEventListener("click", this.onToggleOpenClickListener);
    }
    buildOutputPlaceholder() {
      if (!this.outputPlaceholder) {
        this.outputPlaceholder = htmlToElement(this.outputEmptyTemplate);
      }
      this.appendItemsToWrapper(this.outputPlaceholder);
    }
    destroyOutputLoader() {
      if (this.outputLoader) this.outputLoader.remove();
      this.outputLoader = null;
    }
    itemRender(item) {
      const val = item.querySelector("[data-hs-combo-box-value]").textContent;
      const data = JSON.parse(item.getAttribute("data-hs-combo-box-item-stored-data")) ?? null;
      if (this.itemsWrapper) this.itemsWrapper.append(item);
      else this.output.append(item);
      if (!this.preventSelection) {
        item.addEventListener("click", () => {
          this.close(val, data);
          this.setSelectedByValue(this.valuesBySelector(item));
        });
      }
    }
    plainRender(items) {
      items.forEach((item) => {
        this.itemRender(item);
      });
    }
    jsonItemsRender(items) {
      items.forEach((item, index) => {
        const newItem = htmlToElement(this.outputItemTemplate);
        newItem.setAttribute(
          "data-hs-combo-box-item-stored-data",
          JSON.stringify(item)
        );
        newItem.querySelectorAll("[data-hs-combo-box-output-item-field]").forEach((el) => {
          const valueAttr = el.getAttribute(
            "data-hs-combo-box-output-item-field"
          );
          let value = "";
          try {
            const fields = JSON.parse(valueAttr);
            if (Array.isArray(fields)) {
              value = fields.map((field) => this.getNestedProperty(item, field)).filter(Boolean).join(" ");
            } else {
              value = this.getNestedProperty(item, valueAttr);
            }
          } catch (e2) {
            value = this.getNestedProperty(item, valueAttr);
          }
          el.textContent = value ?? "";
          if (!value && el.hasAttribute("data-hs-combo-box-output-item-hide-if-empty")) {
            el.style.display = "none";
          }
        });
        newItem.querySelectorAll("[data-hs-combo-box-search-text]").forEach((el) => {
          const valueAttr = el.getAttribute(
            "data-hs-combo-box-output-item-field"
          );
          let value = "";
          try {
            const fields = JSON.parse(valueAttr);
            if (Array.isArray(fields)) {
              value = fields.map((field) => this.getNestedProperty(item, field)).filter(Boolean).join(" ");
            } else {
              value = this.getNestedProperty(item, valueAttr);
            }
          } catch (e2) {
            value = this.getNestedProperty(item, valueAttr);
          }
          el.setAttribute(
            "data-hs-combo-box-search-text",
            value ?? ""
          );
        });
        newItem.querySelectorAll("[data-hs-combo-box-output-item-attr]").forEach((el) => {
          const attributes = JSON.parse(
            el.getAttribute("data-hs-combo-box-output-item-attr")
          );
          attributes.forEach((attr) => {
            let value = item[attr.valueFrom];
            if (attr.attr === "class" && el.className) {
              el.className = `${el.className} ${value}`.trim();
            } else {
              el.setAttribute(attr.attr, value);
            }
          });
        });
        newItem.setAttribute("tabIndex", `${index}`);
        if (this.groupingType === "tabs" || this.groupingType === "default") {
          newItem.setAttribute(
            "data-hs-combo-box-output-item",
            `{"group": {"name": "${item[this.apiGroupField]}", "title": "${item[this.apiGroupField]}"}}`
          );
        }
        this.items = [...this.items, newItem];
        if (!this.preventSelection) {
          newItem.addEventListener("click", () => {
            this.close(
              newItem.querySelector("[data-hs-combo-box-value]").textContent,
              JSON.parse(newItem.getAttribute("data-hs-combo-box-item-stored-data"))
            );
            this.setSelectedByValue(this.valuesBySelector(newItem));
          });
        }
        this.appendItemsToWrapper(newItem);
      });
    }
    groupDefaultRender() {
      this.groups.forEach((el) => {
        const title = htmlToElement(this.groupingTitleTemplate);
        title.setAttribute("data-hs-combo-box-group-title", el.name);
        title.classList.add("--exclude-accessibility");
        title.innerText = el.title;
        if (this.itemsWrapper) this.itemsWrapper.append(title);
        else this.output.append(title);
        const items = this.sortItems().filter((f) => {
          const { group } = JSON.parse(
            f.getAttribute("data-hs-combo-box-output-item")
          );
          return group.name === el.name;
        });
        this.plainRender(items);
      });
    }
    groupTabsRender() {
      const tabsScroll = htmlToElement(this.tabsWrapperTemplate);
      const tabsWrapper = htmlToElement(
        `<div class="flex flex-nowrap gap-x-2"></div>`
      );
      tabsScroll.append(tabsWrapper);
      this.output.insertBefore(tabsScroll, this.output.firstChild);
      const tabDef = htmlToElement(this.groupingTitleTemplate);
      tabDef.setAttribute("data-hs-combo-box-group-title", "all");
      tabDef.classList.add("--exclude-accessibility", "active");
      tabDef.innerText = "All";
      this.tabs = [...this.tabs, tabDef];
      tabsWrapper.append(tabDef);
      tabDef.addEventListener("click", () => {
        this.selectedGroup = "all";
        const selectedTab = this.tabs.find(
          (elI) => elI.getAttribute("data-hs-combo-box-group-title") === this.selectedGroup
        );
        this.tabs.forEach((el) => el.classList.remove("active"));
        selectedTab.classList.add("active");
        this.setItemsVisibility();
      });
      this.groups.forEach((el) => {
        const tab = htmlToElement(this.groupingTitleTemplate);
        tab.setAttribute("data-hs-combo-box-group-title", el.name);
        tab.classList.add("--exclude-accessibility");
        tab.innerText = el.title;
        this.tabs = [...this.tabs, tab];
        tabsWrapper.append(tab);
        tab.addEventListener("click", () => {
          this.selectedGroup = el.name;
          const selectedTab = this.tabs.find(
            (elI) => elI.getAttribute("data-hs-combo-box-group-title") === this.selectedGroup
          );
          this.tabs.forEach((el2) => el2.classList.remove("active"));
          selectedTab.classList.add("active");
          this.setItemsVisibility();
        });
      });
    }
    itemsFromHtml() {
      if (this.groupingType === "default") {
        this.groupDefaultRender();
      } else if (this.groupingType === "tabs") {
        const items = this.sortItems();
        this.groupTabsRender();
        this.plainRender(items);
      } else {
        const items = this.sortItems();
        this.plainRender(items);
      }
      this.setResults(this.input.value);
    }
    async itemsFromJson() {
      if (this.isSearchLengthExceeded) {
        this.buildOutputPlaceholder();
        return false;
      }
      this.buildOutputLoader();
      try {
        const query = `${this.apiQuery}`;
        let searchQuery;
        let searchPath;
        let url = this.apiUrl;
        if (!this.apiSearchQuery && this.apiSearchPath) {
          if (this.apiSearchDefaultPath && this.value === "") {
            searchPath = `/${this.apiSearchDefaultPath}`;
          } else {
            searchPath = `/${this.apiSearchPath}/${this.value.toLowerCase()}`;
          }
          if (this.apiSearchPath || this.apiSearchDefaultPath) {
            url += searchPath;
          }
        } else {
          searchQuery = `${this.apiSearchQuery}=${this.value.toLowerCase()}`;
          if (this.apiQuery && this.apiSearchQuery) {
            url += `?${searchQuery}&${query}`;
          } else if (this.apiQuery) {
            url += `?${query}`;
          } else if (this.apiSearchQuery) {
            url += `?${searchQuery}`;
          }
        }
        const res = await fetch(url, this.apiHeaders);
        if (!res.ok) {
          this.items = [];
          if (this.itemsWrapper) this.itemsWrapper.innerHTML = "";
          else this.output.innerHTML = "";
          this.setResults(this.input.value);
          return;
        }
        let items = await res.json();
        if (this.apiDataPart) {
          items = items[this.apiDataPart];
        }
        if (!Array.isArray(items)) {
          items = [];
        }
        if (this.apiSearchQuery || this.apiSearchPath) {
          this.items = [];
        }
        if (this.itemsWrapper) {
          this.itemsWrapper.innerHTML = "";
        } else {
          this.output.innerHTML = "";
        }
        if (this.groupingType === "tabs") {
          this.setApiGroups(items);
          this.groupTabsRender();
          this.jsonItemsRender(items);
        } else if (this.groupingType === "default") {
          this.setApiGroups(items);
          this.groups.forEach((el) => {
            const title = htmlToElement(this.groupingTitleTemplate);
            title.setAttribute("data-hs-combo-box-group-title", el.name);
            title.classList.add("--exclude-accessibility");
            title.innerText = el.title;
            const newItems = items.filter(
              (i) => i[this.apiGroupField] === el.name
            );
            if (this.itemsWrapper) this.itemsWrapper.append(title);
            else this.output.append(title);
            this.jsonItemsRender(newItems);
          });
        } else {
          this.jsonItemsRender(items);
        }
        this.setResults(
          this.input.value.length <= this.minSearchLength ? "" : this.input.value
        );
        this.updatePlaceholderVisibility();
      } catch (err) {
        console.error("Error fetching items:", err);
        this.items = [];
        if (this.itemsWrapper) {
          this.itemsWrapper.innerHTML = "";
        } else {
          this.output.innerHTML = "";
        }
        this.setResults(this.input.value);
      } finally {
        this.destroyOutputLoader();
      }
    }
    appendItemsToWrapper(item) {
      if (this.itemsWrapper) {
        this.itemsWrapper.append(item);
      } else {
        this.output.append(item);
      }
    }
    resultItems() {
      if (!this.items.length) return false;
      this.setItemsVisibility();
      this.setSelectedByValue([this.selected]);
    }
    destroyOutputPlaceholder() {
      if (this.outputPlaceholder) this.outputPlaceholder.remove();
      this.outputPlaceholder = null;
    }
    getPreparedItems(isReversed = false, output) {
      if (!output) return null;
      const preparedItems = isReversed ? Array.from(
        output.querySelectorAll(":scope > *:not(.--exclude-accessibility)")
      ).filter((el) => el.style.display !== "none").reverse() : Array.from(
        output.querySelectorAll(":scope > *:not(.--exclude-accessibility)")
      ).filter((el) => el.style.display !== "none");
      const items = preparedItems.filter(
        (el) => !el.classList.contains("disabled")
      );
      return items;
    }
    setHighlighted(prev, current, input) {
      current.focus();
      input.value = current.querySelector("[data-hs-combo-box-value]").getAttribute("data-hs-combo-box-search-text");
      if (prev) prev.classList.remove("hs-combo-box-output-item-highlighted");
      current.classList.add("hs-combo-box-output-item-highlighted");
    }
    // Accessibility methods
    setupAccessibility() {
      const output = this.itemsWrapper ?? this.output;
      this.accessibilityComponent = window.HSAccessibilityObserver.registerComponent(
        this.el,
        {
          onEnter: () => this.onEnter(),
          onSpace: () => this.onEnter(),
          onEsc: () => {
            if (this.isOpened) {
              this.close();
              if (this.input) this.input.focus();
            }
          },
          onArrow: (evt) => {
            if (!this.isOpened && evt.key === "ArrowDown") {
              this.open();
              return;
            }
            if (this.isOpened) {
              switch (evt.key) {
                case "ArrowDown":
                  this.focusMenuItem("next");
                  break;
                case "ArrowUp":
                  this.focusMenuItem("prev");
                  break;
                case "Home":
                  this.onStartEnd(true);
                  break;
                case "End":
                  this.onStartEnd(false);
                  break;
              }
            }
          }
          // onTab: () => this.onTab(),
          // onFirstLetter: (key: string) => this.onFirstLetter(key),
        },
        this.isOpened,
        "ComboBox",
        "[data-hs-combo-box]",
        output
      );
    }
    onEnter() {
      if (!this.isOpened) {
        this.open();
      } else {
        const highlighted = this.output.querySelector(
          ".hs-combo-box-output-item-highlighted"
        );
        if (highlighted) {
          this.close(
            highlighted.querySelector("[data-hs-combo-box-value]")?.getAttribute(
              "data-hs-combo-box-search-text"
            ) ?? null,
            JSON.parse(
              highlighted.getAttribute("data-hs-combo-box-item-stored-data")
            ) ?? null
          );
          if (this.input) this.input.focus();
        }
      }
    }
    focusMenuItem(direction) {
      const output = this.itemsWrapper ?? this.output;
      if (!output) return false;
      const options = Array.from(
        output.querySelectorAll(":scope > *:not(.--exclude-accessibility)")
      ).filter((el) => el.style.display !== "none");
      if (!options.length) return false;
      const current = output.querySelector(
        ".hs-combo-box-output-item-highlighted"
      );
      const currentIndex = current ? options.indexOf(current) : -1;
      const nextIndex = direction === "next" ? (currentIndex + 1) % options.length : (currentIndex - 1 + options.length) % options.length;
      if (current) {
        current.classList.remove("hs-combo-box-output-item-highlighted");
      }
      options[nextIndex].classList.add("hs-combo-box-output-item-highlighted");
      options[nextIndex].focus();
      this.input.value = options[nextIndex].querySelector("[data-hs-combo-box-value]").getAttribute("data-hs-combo-box-search-text");
    }
    onStartEnd(isStart = true) {
      const output = this.itemsWrapper ?? this.output;
      if (!output) return false;
      const options = Array.from(
        output.querySelectorAll(":scope > *:not(.--exclude-accessibility)")
      ).filter((el) => el.style.display !== "none");
      if (!options.length) return false;
      const current = output.querySelector(
        ".hs-combo-box-output-item-highlighted"
      );
      this.setHighlighted(
        current,
        options[0],
        this.input
      );
    }
    // Public methods
    getCurrentData() {
      return this.currentData;
    }
    setCurrent() {
      if (window.$hsComboBoxCollection.length) {
        window.$hsComboBoxCollection.map((el) => el.element.isCurrent = false);
        this.isCurrent = true;
      }
    }
    open(val) {
      if (this.animationInProcess) return false;
      if (typeof val !== "undefined") this.setValueAndOpen(val);
      if (this.preventVisibility) return false;
      this.animationInProcess = true;
      this.output.style.display = "block";
      if (!this.preventAutoPosition) this.recalculateDirection();
      setTimeout(() => {
        if (this?.input?.ariaExpanded) this.input.ariaExpanded = "true";
        if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
        this.el.classList.add("active");
        this.animationInProcess = false;
      });
      this.isOpened = true;
      if (window.HSAccessibilityObserver && this.accessibilityComponent) {
        window.HSAccessibilityObserver.updateComponentState(
          this.accessibilityComponent,
          true
        );
      }
    }
    close(val, data = null) {
      if (this.animationInProcess) return false;
      if (this.preventVisibility) {
        this.setValueAndClear(val, data);
        if (this.input.value !== "") this.el.classList.add("has-value");
        else this.el.classList.remove("has-value");
        return false;
      }
      if (!this.preserveSelectionOnEmpty && this.input.value.trim() === "") {
        this.selected = "";
        this.value = "";
      }
      this.animationInProcess = true;
      if (this?.input?.ariaExpanded) this.input.ariaExpanded = "false";
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
      this.el.classList.remove("active");
      if (!this.preventAutoPosition) {
        this.output.classList.remove("bottom-full", "top-full");
        this.output.style.marginTop = "";
        this.output.style.marginBottom = "";
      }
      afterTransition(this.output, () => {
        this.output.style.display = "none";
        this.setValueAndClear(val, data || null);
        this.animationInProcess = false;
      });
      if (this.input.value !== "") this.el.classList.add("has-value");
      else this.el.classList.remove("has-value");
      this.isOpened = false;
      if (window.HSAccessibilityObserver && this.accessibilityComponent) {
        window.HSAccessibilityObserver.updateComponentState(
          this.accessibilityComponent,
          false
        );
      }
    }
    recalculateDirection() {
      if (isEnoughSpace(
        this.output,
        this.input,
        "bottom",
        this.gap,
        this.viewport
      )) {
        this.output.classList.remove("bottom-full");
        this.output.style.marginBottom = "";
        this.output.classList.add("top-full");
        this.output.style.marginTop = `${this.gap}px`;
      } else {
        this.output.classList.remove("top-full");
        this.output.style.marginTop = "";
        this.output.classList.add("bottom-full");
        this.output.style.marginBottom = `${this.gap}px`;
      }
    }
    destroy() {
      this.input.removeEventListener("focus", this.onInputFocusListener);
      this.input.removeEventListener("input", this.onInputInputListener);
      this.toggle.removeEventListener("click", this.onToggleClickListener);
      if (this.toggleClose) {
        this.toggleClose.removeEventListener(
          "click",
          this.onToggleCloseClickListener
        );
      }
      if (this.toggleOpen) {
        this.toggleOpen.removeEventListener(
          "click",
          this.onToggleOpenClickListener
        );
      }
      this.el.classList.remove("has-value", "active");
      if (this.items.length) {
        this.items.forEach((el) => {
          el.classList.remove("selected");
          el.style.display = "";
        });
      }
      this.output.removeAttribute("role");
      this.output.removeAttribute("tabindex");
      this.output.removeAttribute("aria-orientation");
      if (this.outputLoader) {
        this.outputLoader.remove();
        this.outputLoader = null;
      }
      if (this.outputPlaceholder) {
        this.outputPlaceholder.remove();
        this.outputPlaceholder = null;
      }
      if (this.apiUrl) {
        this.output.innerHTML = "";
      }
      this.items = [];
      if (typeof window !== "undefined" && window.HSAccessibilityObserver) {
        window.HSAccessibilityObserver.unregisterComponent(
          this.accessibilityComponent
        );
      }
      window.$hsComboBoxCollection = window.$hsComboBoxCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsComboBoxCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsComboBoxCollection) {
        window.$hsComboBoxCollection = [];
        window.addEventListener("click", (evt) => {
          const evtTarget = evt.target;
          _HSComboBox.closeCurrentlyOpened(evtTarget);
        });
      }
      if (window.$hsComboBoxCollection) {
        window.$hsComboBoxCollection = window.$hsComboBoxCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll("[data-hs-combo-box]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsComboBoxCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          const data = el.getAttribute("data-hs-combo-box");
          const options = data ? JSON.parse(data) : {};
          new _HSComboBox(el, options);
        }
      });
    }
    static close(target) {
      const elInCollection = window.$hsComboBoxCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      if (elInCollection && elInCollection.element.isOpened) {
        elInCollection.element.close();
      }
    }
    static closeCurrentlyOpened(evtTarget = null) {
      if (!evtTarget.closest("[data-hs-combo-box].active")) {
        const currentlyOpened = window.$hsComboBoxCollection.filter(
          (el) => el.element.isOpened
        ) || null;
        if (currentlyOpened) {
          currentlyOpened.forEach((el) => {
            el.element.close();
          });
        }
      }
    }
  };
  window.addEventListener("load", () => {
    HSComboBox.autoInit();
  });
  document.addEventListener("scroll", () => {
    if (!window.$hsComboBoxCollection) return false;
    const target = window.$hsComboBoxCollection.find((el) => el.element.isOpened);
    if (target && !target.element.preventAutoPosition) {
      target.element.recalculateDirection();
    }
  });
  if (typeof window !== "undefined") {
    window.HSComboBox = HSComboBox;
  }
  var combobox_default = HSComboBox;

  // node_modules/preline/src/plugins/dropdown/index.ts
  init_utils();

  // node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
  var min = Math.min;
  var max = Math.max;
  var round = Math.round;
  var floor = Math.floor;
  var createCoords = (v) => ({
    x: v,
    y: v
  });
  var oppositeSideMap = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  var oppositeAlignmentMap = {
    start: "end",
    end: "start"
  };
  function evaluate(value, param) {
    return typeof value === "function" ? value(param) : value;
  }
  function getSide(placement) {
    return placement.split("-")[0];
  }
  function getAlignment(placement) {
    return placement.split("-")[1];
  }
  function getOppositeAxis(axis) {
    return axis === "x" ? "y" : "x";
  }
  function getAxisLength(axis) {
    return axis === "y" ? "height" : "width";
  }
  var yAxisSides = /* @__PURE__ */ new Set(["top", "bottom"]);
  function getSideAxis(placement) {
    return yAxisSides.has(getSide(placement)) ? "y" : "x";
  }
  function getAlignmentAxis(placement) {
    return getOppositeAxis(getSideAxis(placement));
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const length = getAxisLength(alignmentAxis);
    let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
  }
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
  }
  var lrPlacement = ["left", "right"];
  var rlPlacement = ["right", "left"];
  var tbPlacement = ["top", "bottom"];
  var btPlacement = ["bottom", "top"];
  function getSideList(side, isStart, rtl) {
    switch (side) {
      case "top":
      case "bottom":
        if (rtl) return isStart ? rlPlacement : lrPlacement;
        return isStart ? lrPlacement : rlPlacement;
      case "left":
      case "right":
        return isStart ? tbPlacement : btPlacement;
      default:
        return [];
    }
  }
  function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
    const alignment = getAlignment(placement);
    let list = getSideList(getSide(placement), direction === "start", rtl);
    if (alignment) {
      list = list.map((side) => side + "-" + alignment);
      if (flipAlignment) {
        list = list.concat(list.map(getOppositeAlignmentPlacement));
      }
    }
    return list;
  }
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
  }
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding
    };
  }
  function getPaddingObject(padding) {
    return typeof padding !== "number" ? expandPaddingObject(padding) : {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  function rectToClientRect(rect) {
    const {
      x,
      y,
      width,
      height
    } = rect;
    return {
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      x,
      y
    };
  }

  // node_modules/@floating-ui/core/dist/floating-ui.core.mjs
  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const sideAxis = getSideAxis(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const alignLength = getAxisLength(alignmentAxis);
    const side = getSide(placement);
    const isVertical = sideAxis === "y";
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
    let coords;
    switch (side) {
      case "top":
        coords = {
          x: commonX,
          y: reference.y - floating.height
        };
        break;
      case "bottom":
        coords = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case "right":
        coords = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case "left":
        coords = {
          x: reference.x - floating.width,
          y: commonY
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y
        };
    }
    switch (getAlignment(placement)) {
      case "start":
        coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case "end":
        coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }
  var computePosition = async (reference, floating, config) => {
    const {
      placement = "bottom",
      strategy = "absolute",
      middleware = [],
      platform: platform2
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
    let rects = await platform2.getElementRects({
      reference,
      floating,
      strategy
    });
    let {
      x,
      y
    } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i = 0; i < validMiddleware.length; i++) {
      const {
        name,
        fn
      } = validMiddleware[i];
      const {
        x: nextX,
        y: nextY,
        data,
        reset: reset2
      } = await fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform: platform2,
        elements: {
          reference,
          floating
        }
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = {
        ...middlewareData,
        [name]: {
          ...middlewareData[name],
          ...data
        }
      };
      if (reset2 && resetCount <= 50) {
        resetCount++;
        if (typeof reset2 === "object") {
          if (reset2.placement) {
            statefulPlacement = reset2.placement;
          }
          if (reset2.rects) {
            rects = reset2.rects === true ? await platform2.getElementRects({
              reference,
              floating,
              strategy
            }) : reset2.rects;
          }
          ({
            x,
            y
          } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
        }
        i = -1;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData
    };
  };
  async function detectOverflow(state2, options) {
    var _await$platform$isEle;
    if (options === void 0) {
      options = {};
    }
    const {
      x,
      y,
      platform: platform2,
      rects,
      elements,
      strategy
    } = state2;
    const {
      boundary = "clippingAncestors",
      rootBoundary = "viewport",
      elementContext = "floating",
      altBoundary = false,
      padding = 0
    } = evaluate(options, state2);
    const paddingObject = getPaddingObject(padding);
    const altContext = elementContext === "floating" ? "reference" : "floating";
    const element = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
      element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
      boundary,
      rootBoundary,
      strategy
    }));
    const rect = elementContext === "floating" ? {
      x,
      y,
      width: rects.floating.width,
      height: rects.floating.height
    } : rects.reference;
    const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
    const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
      x: 1,
      y: 1
    } : {
      x: 1,
      y: 1
    };
    const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
      elements,
      rect,
      offsetParent,
      strategy
    }) : rect);
    return {
      top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
      bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
      left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
      right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
    };
  }
  var flip = function(options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "flip",
      options,
      async fn(state2) {
        var _middlewareData$arrow, _middlewareData$flip;
        const {
          placement,
          middlewareData,
          rects,
          initialPlacement,
          platform: platform2,
          elements
        } = state2;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
          fallbackPlacements: specifiedFallbackPlacements,
          fallbackStrategy = "bestFit",
          fallbackAxisSideDirection = "none",
          flipAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options, state2);
        if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        const side = getSide(placement);
        const initialSideAxis = getSideAxis(initialPlacement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
        const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
        const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
        if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
          fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
        }
        const placements2 = [initialPlacement, ...fallbackPlacements];
        const overflow = await detectOverflow(state2, detectOverflowOptions);
        const overflows = [];
        let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
        if (checkMainAxis) {
          overflows.push(overflow[side]);
        }
        if (checkCrossAxis) {
          const sides2 = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
        }
        overflowsData = [...overflowsData, {
          placement,
          overflows
        }];
        if (!overflows.every((side2) => side2 <= 0)) {
          var _middlewareData$flip2, _overflowsData$filter;
          const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
          const nextPlacement = placements2[nextIndex];
          if (nextPlacement) {
            const ignoreCrossAxisOverflow = checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false;
            if (!ignoreCrossAxisOverflow || // We leave the current main axis only if every placement on that axis
            // overflows the main axis.
            overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) {
              return {
                data: {
                  index: nextIndex,
                  overflows: overflowsData
                },
                reset: {
                  placement: nextPlacement
                }
              };
            }
          }
          let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
          if (!resetPlacement) {
            switch (fallbackStrategy) {
              case "bestFit": {
                var _overflowsData$filter2;
                const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                  if (hasFallbackAxisSideDirection) {
                    const currentSideAxis = getSideAxis(d.placement);
                    return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                    // reading directions favoring greater width.
                    currentSideAxis === "y";
                  }
                  return true;
                }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
                if (placement2) {
                  resetPlacement = placement2;
                }
                break;
              }
              case "initialPlacement":
                resetPlacement = initialPlacement;
                break;
            }
          }
          if (placement !== resetPlacement) {
            return {
              reset: {
                placement: resetPlacement
              }
            };
          }
        }
        return {};
      }
    };
  };
  var originSides = /* @__PURE__ */ new Set(["left", "top"]);
  async function convertValueToCoords(state2, options) {
    const {
      placement,
      platform: platform2,
      elements
    } = state2;
    const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getSideAxis(placement) === "y";
    const mainAxisMulti = originSides.has(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = evaluate(options, state2);
    let {
      mainAxis,
      crossAxis,
      alignmentAxis
    } = typeof rawValue === "number" ? {
      mainAxis: rawValue,
      crossAxis: 0,
      alignmentAxis: null
    } : {
      mainAxis: rawValue.mainAxis || 0,
      crossAxis: rawValue.crossAxis || 0,
      alignmentAxis: rawValue.alignmentAxis
    };
    if (alignment && typeof alignmentAxis === "number") {
      crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
    }
    return isVertical ? {
      x: crossAxis * crossAxisMulti,
      y: mainAxis * mainAxisMulti
    } : {
      x: mainAxis * mainAxisMulti,
      y: crossAxis * crossAxisMulti
    };
  }
  var offset = function(options) {
    if (options === void 0) {
      options = 0;
    }
    return {
      name: "offset",
      options,
      async fn(state2) {
        var _middlewareData$offse, _middlewareData$arrow;
        const {
          x,
          y,
          placement,
          middlewareData
        } = state2;
        const diffCoords = await convertValueToCoords(state2, options);
        if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: {
            ...diffCoords,
            placement
          }
        };
      }
    };
  };

  // node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
  function hasWindow() {
    return typeof window !== "undefined";
  }
  function getNodeName(node) {
    if (isNode(node)) {
      return (node.nodeName || "").toLowerCase();
    }
    return "#document";
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getDocumentElement(node) {
    var _ref;
    return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
  }
  function isNode(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Node || value instanceof getWindow(value).Node;
  }
  function isElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Element || value instanceof getWindow(value).Element;
  }
  function isHTMLElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
  }
  function isShadowRoot(value) {
    if (!hasWindow() || typeof ShadowRoot === "undefined") {
      return false;
    }
    return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
  }
  var invalidOverflowDisplayValues = /* @__PURE__ */ new Set(["inline", "contents"]);
  function isOverflowElement(element) {
    const {
      overflow,
      overflowX,
      overflowY,
      display
    } = getComputedStyle2(element);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
  }
  var tableElements = /* @__PURE__ */ new Set(["table", "td", "th"]);
  function isTableElement(element) {
    return tableElements.has(getNodeName(element));
  }
  var topLayerSelectors = [":popover-open", ":modal"];
  function isTopLayer(element) {
    return topLayerSelectors.some((selector) => {
      try {
        return element.matches(selector);
      } catch (_e) {
        return false;
      }
    });
  }
  var transformProperties = ["transform", "translate", "scale", "rotate", "perspective"];
  var willChangeValues = ["transform", "translate", "scale", "rotate", "perspective", "filter"];
  var containValues = ["paint", "layout", "strict", "content"];
  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
    return transformProperties.some((value) => css[value] ? css[value] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || willChangeValues.some((value) => (css.willChange || "").includes(value)) || containValues.some((value) => (css.contain || "").includes(value));
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else if (isTopLayer(currentNode)) {
        return null;
      }
      currentNode = getParentNode(currentNode);
    }
    return null;
  }
  function isWebKit() {
    if (typeof CSS === "undefined" || !CSS.supports) return false;
    return CSS.supports("-webkit-backdrop-filter", "none");
  }
  var lastTraversableNodeNames = /* @__PURE__ */ new Set(["html", "body", "#document"]);
  function isLastTraversableNode(node) {
    return lastTraversableNodeNames.has(getNodeName(node));
  }
  function getComputedStyle2(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
    return {
      scrollLeft: element.scrollX,
      scrollTop: element.scrollY
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === "html") {
      return node;
    }
    const result = (
      // Step into the shadow DOM of the parent of a slotted node.
      node.assignedSlot || // DOM Element detected.
      node.parentNode || // ShadowRoot detected.
      isShadowRoot(node) && node.host || // Fallback.
      getDocumentElement(node)
    );
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list, traverseIframes) {
    var _node$ownerDocument2;
    if (list === void 0) {
      list = [];
    }
    if (traverseIframes === void 0) {
      traverseIframes = true;
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      const frameElement = getFrameElement(win);
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
  function getFrameElement(win) {
    return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
  }

  // node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
  function getCssDimensions(element) {
    const css = getComputedStyle2(element);
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element);
    const offsetWidth = hasOffset ? element.offsetWidth : width;
    const offsetHeight = hasOffset ? element.offsetHeight : height;
    const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return {
      width,
      height,
      $: shouldFallback
    };
  }
  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }
  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const {
      width,
      height,
      $
    } = getCssDimensions(domElement);
    let x = ($ ? round(rect.width) : rect.width) / width;
    let y = ($ ? round(rect.height) : rect.height) / height;
    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y
    };
  }
  var noOffsets = /* @__PURE__ */ createCoords(0);
  function getVisualOffsets(element) {
    const win = getWindow(element);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return {
      x: win.visualViewport.offsetLeft,
      y: win.visualViewport.offsetTop
    };
  }
  function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
      return false;
    }
    return isFixed;
  }
  function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentWin = win;
      let currentIFrame = getFrameElement(currentWin);
      while (currentIFrame && offsetParent && offsetWin !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle2(currentIFrame);
        const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }
    return rectToClientRect({
      width,
      height,
      x,
      y
    });
  }
  function getWindowScrollBarX(element, rect) {
    const leftScroll = getNodeScroll(element).scrollLeft;
    if (!rect) {
      return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
    }
    return rect.left + leftScroll;
  }
  function getHTMLOffset(documentElement, scroll) {
    const htmlRect = documentElement.getBoundingClientRect();
    const x = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
    const y = htmlRect.top + scroll.scrollTop;
    return {
      x,
      y
    };
  }
  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      elements,
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isFixed = strategy === "fixed";
    const documentElement = getDocumentElement(offsetParent);
    const topLayer = elements ? isTopLayer(elements.floating) : false;
    if (offsetParent === documentElement || topLayer && isFixed) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
    };
  }
  function getClientRects(element) {
    return Array.from(element.getClientRects());
  }
  function getDocumentRect(element) {
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = element.ownerDocument.body;
    const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
    const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle2(body).direction === "rtl") {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  var SCROLLBAR_MAX = 25;
  function getViewportRect(element, strategy) {
    const win = getWindow(element);
    const html = getDocumentElement(element);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const visualViewportBased = isWebKit();
      if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    const windowScrollbarX = getWindowScrollBarX(html);
    if (windowScrollbarX <= 0) {
      const doc = html.ownerDocument;
      const body = doc.body;
      const bodyStyles = getComputedStyle(body);
      const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
      const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
      if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) {
        width -= clippingStableScrollbarWidth;
      }
    } else if (windowScrollbarX <= SCROLLBAR_MAX) {
      width += windowScrollbarX;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  var absoluteOrFixed = /* @__PURE__ */ new Set(["absolute", "fixed"]);
  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      width,
      height,
      x,
      y
    };
  }
  function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
    let rect;
    if (clippingAncestor === "viewport") {
      rect = getViewportRect(element, strategy);
    } else if (clippingAncestor === "document") {
      rect = getDocumentRect(getDocumentElement(element));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const visualOffsets = getVisualOffsets(element);
      rect = {
        x: clippingAncestor.x - visualOffsets.x,
        y: clippingAncestor.y - visualOffsets.y,
        width: clippingAncestor.width,
        height: clippingAncestor.height
      };
    }
    return rectToClientRect(rect);
  }
  function hasFixedPositionAncestor(element, stopNode) {
    const parentNode = getParentNode(element);
    if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
      return false;
    }
    return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
  }
  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle2(element).position === "fixed";
    let currentNode = elementIsFixed ? getParentNode(element) : element;
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle2(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === "fixed") {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && absoluteOrFixed.has(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
      if (shouldDropCurrentNode) {
        result = result.filter((ancestor) => ancestor !== currentNode);
      } else {
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }
  function getClippingRect(_ref) {
    let {
      element,
      boundary,
      rootBoundary,
      strategy
    } = _ref;
    const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top
    };
  }
  function getDimensions(element) {
    const {
      width,
      height
    } = getCssDimensions(element);
    return {
      width,
      height
    };
  }
  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === "fixed";
    const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = createCoords(0);
    function setLeftRTLScrollbarOffset() {
      offsets.x = getWindowScrollBarX(documentElement);
    }
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        setLeftRTLScrollbarOffset();
      }
    }
    if (isFixed && !isOffsetParentAnElement && documentElement) {
      setLeftRTLScrollbarOffset();
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
    const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
    const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
    return {
      x,
      y,
      width: rect.width,
      height: rect.height
    };
  }
  function isStaticPositioned(element) {
    return getComputedStyle2(element).position === "static";
  }
  function getTrueOffsetParent(element, polyfill) {
    if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    let rawOffsetParent = element.offsetParent;
    if (getDocumentElement(element) === rawOffsetParent) {
      rawOffsetParent = rawOffsetParent.ownerDocument.body;
    }
    return rawOffsetParent;
  }
  function getOffsetParent(element, polyfill) {
    const win = getWindow(element);
    if (isTopLayer(element)) {
      return win;
    }
    if (!isHTMLElement(element)) {
      let svgOffsetParent = getParentNode(element);
      while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
        if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
          return svgOffsetParent;
        }
        svgOffsetParent = getParentNode(svgOffsetParent);
      }
      return win;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
      return win;
    }
    return offsetParent || getContainingBlock(element) || win;
  }
  var getElementRects = async function(data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = await getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
      floating: {
        x: 0,
        y: 0,
        width: floatingDimensions.width,
        height: floatingDimensions.height
      }
    };
  };
  function isRTL(element) {
    return getComputedStyle2(element).direction === "rtl";
  }
  var platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL
  };
  function rectsAreEqual(a, b) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
  }
  function observeMove(element, onMove) {
    let io = null;
    let timeoutId;
    const root = getDocumentElement(element);
    function cleanup() {
      var _io;
      clearTimeout(timeoutId);
      (_io = io) == null || _io.disconnect();
      io = null;
    }
    function refresh(skip, threshold) {
      if (skip === void 0) {
        skip = false;
      }
      if (threshold === void 0) {
        threshold = 1;
      }
      cleanup();
      const elementRectForRootMargin = element.getBoundingClientRect();
      const {
        left,
        top,
        width,
        height
      } = elementRectForRootMargin;
      if (!skip) {
        onMove();
      }
      if (!width || !height) {
        return;
      }
      const insetTop = floor(top);
      const insetRight = floor(root.clientWidth - (left + width));
      const insetBottom = floor(root.clientHeight - (top + height));
      const insetLeft = floor(left);
      const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
      const options = {
        rootMargin,
        threshold: max(0, min(1, threshold)) || 1
      };
      let isFirstUpdate = true;
      function handleObserve(entries) {
        const ratio = entries[0].intersectionRatio;
        if (ratio !== threshold) {
          if (!isFirstUpdate) {
            return refresh();
          }
          if (!ratio) {
            timeoutId = setTimeout(() => {
              refresh(false, 1e-7);
            }, 1e3);
          } else {
            refresh(false, ratio);
          }
        }
        if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
          refresh();
        }
        isFirstUpdate = false;
      }
      try {
        io = new IntersectionObserver(handleObserve, {
          ...options,
          // Handle <iframe>s
          root: root.ownerDocument
        });
      } catch (_e) {
        io = new IntersectionObserver(handleObserve, options);
      }
      io.observe(element);
    }
    refresh(true);
    return cleanup;
  }
  function autoUpdate(reference, floating, update2, options) {
    if (options === void 0) {
      options = {};
    }
    const {
      ancestorScroll = true,
      ancestorResize = true,
      elementResize = typeof ResizeObserver === "function",
      layoutShift = typeof IntersectionObserver === "function",
      animationFrame = false
    } = options;
    const referenceEl = unwrapElement(reference);
    const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.addEventListener("scroll", update2, {
        passive: true
      });
      ancestorResize && ancestor.addEventListener("resize", update2);
    });
    const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update2) : null;
    let reobserveFrame = -1;
    let resizeObserver = null;
    if (elementResize) {
      resizeObserver = new ResizeObserver((_ref) => {
        let [firstEntry] = _ref;
        if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
          resizeObserver.unobserve(floating);
          cancelAnimationFrame(reobserveFrame);
          reobserveFrame = requestAnimationFrame(() => {
            var _resizeObserver;
            (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
          });
        }
        update2();
      });
      if (referenceEl && !animationFrame) {
        resizeObserver.observe(referenceEl);
      }
      resizeObserver.observe(floating);
    }
    let frameId;
    let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
    if (animationFrame) {
      frameLoop();
    }
    function frameLoop() {
      const nextRefRect = getBoundingClientRect(reference);
      if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
        update2();
      }
      prevRefRect = nextRefRect;
      frameId = requestAnimationFrame(frameLoop);
    }
    update2();
    return () => {
      var _resizeObserver2;
      ancestors.forEach((ancestor) => {
        ancestorScroll && ancestor.removeEventListener("scroll", update2);
        ancestorResize && ancestor.removeEventListener("resize", update2);
      });
      cleanupIo == null || cleanupIo();
      (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
      resizeObserver = null;
      if (animationFrame) {
        cancelAnimationFrame(frameId);
      }
    };
  }
  var offset2 = offset;
  var flip2 = flip;
  var computePosition2 = (reference, floating, options) => {
    const cache = /* @__PURE__ */ new Map();
    const mergedOptions = {
      platform,
      ...options
    };
    const platformWithCache = {
      ...mergedOptions.platform,
      _c: cache
    };
    return computePosition(reference, floating, {
      ...mergedOptions,
      platform: platformWithCache
    });
  };

  // node_modules/preline/src/plugins/dropdown/index.ts
  init_base_plugin();
  init_accessibility_manager();
  init_constants();
  var HSDropdown = class _HSDropdown extends HSBasePlugin {
    accessibilityComponent;
    toggle;
    closers;
    menu;
    eventMode;
    closeMode;
    hasAutofocus;
    autofocusOnKeyboardOnly;
    animationInProcess;
    longPressTimer = null;
    openedViaKeyboard = false;
    onElementMouseEnterListener;
    onElementMouseLeaveListener;
    onToggleClickListener;
    onToggleContextMenuListener;
    onTouchStartListener = null;
    onTouchEndListener = null;
    onCloserClickListener;
    constructor(el, options, events) {
      super(el, options, events);
      this.toggle = this.el.querySelector(":scope > .hs-dropdown-toggle") || this.el.querySelector(
        ":scope > .hs-dropdown-toggle-wrapper > .hs-dropdown-toggle"
      ) || this.el.children[0];
      this.closers = Array.from(this.el.querySelectorAll(":scope .hs-dropdown-close")) || null;
      this.menu = this.el.querySelector(":scope > .hs-dropdown-menu");
      this.eventMode = getClassProperty(this.el, "--trigger", "click");
      this.closeMode = getClassProperty(this.el, "--auto-close", "true");
      this.hasAutofocus = stringToBoolean(
        getClassProperty(this.el, "--has-autofocus", "true") || "true"
      );
      this.autofocusOnKeyboardOnly = stringToBoolean(
        getClassProperty(this.el, "--autofocus-on-keyboard-only", "true") || "true"
      );
      this.animationInProcess = false;
      this.onCloserClickListener = [];
      if (this.toggle && this.menu) this.init();
    }
    elementMouseEnter() {
      this.onMouseEnterHandler();
    }
    elementMouseLeave() {
      this.onMouseLeaveHandler();
    }
    toggleClick(evt) {
      this.onClickHandler(evt);
    }
    toggleContextMenu(evt) {
      evt.preventDefault();
      this.onContextMenuHandler(evt);
    }
    handleTouchStart(evt) {
      this.longPressTimer = window.setTimeout(() => {
        evt.preventDefault();
        const touch = evt.touches[0];
        const contextMenuEvent = new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        if (this.toggle) this.toggle.dispatchEvent(contextMenuEvent);
      }, 400);
    }
    handleTouchEnd(evt) {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }
    closerClick() {
      this.close();
    }
    init() {
      this.createCollection(window.$hsDropdownCollection, this);
      if (this.toggle.disabled) return false;
      if (this.toggle) this.buildToggle();
      if (this.menu) this.buildMenu();
      if (this.closers) this.buildClosers();
      if (!isIOS() && !isIpadOS()) {
        this.onElementMouseEnterListener = () => this.elementMouseEnter();
        this.onElementMouseLeaveListener = () => this.elementMouseLeave();
        this.el.addEventListener("mouseenter", this.onElementMouseEnterListener);
        this.el.addEventListener("mouseleave", this.onElementMouseLeaveListener);
      }
      if (typeof window !== "undefined") {
        if (!window.HSAccessibilityObserver) {
          window.HSAccessibilityObserver = new accessibility_manager_default();
        }
        this.setupAccessibility();
      }
    }
    resizeHandler() {
      this.eventMode = getClassProperty(this.el, "--trigger", "click");
      this.closeMode = getClassProperty(this.el, "--auto-close", "true");
      this.hasAutofocus = stringToBoolean(
        getClassProperty(this.el, "--has-autofocus", "true") || "true"
      );
      this.autofocusOnKeyboardOnly = stringToBoolean(
        getClassProperty(this.el, "--autofocus-on-keyboard-only", "true") || "true"
      );
    }
    isOpen() {
      return this.el.classList.contains("open") && !this.menu.classList.contains("hidden");
    }
    buildToggle() {
      if (this?.toggle?.ariaExpanded) {
        if (this.el.classList.contains("open")) this.toggle.ariaExpanded = "true";
        else this.toggle.ariaExpanded = "false";
      }
      if (this.eventMode === "contextmenu") {
        this.onToggleContextMenuListener = (evt) => this.toggleContextMenu(evt);
        this.onTouchStartListener = this.handleTouchStart.bind(this);
        this.onTouchEndListener = this.handleTouchEnd.bind(this);
        this.toggle.addEventListener(
          "contextmenu",
          this.onToggleContextMenuListener
        );
        this.toggle.addEventListener("touchstart", this.onTouchStartListener, {
          passive: false
        });
        this.toggle.addEventListener("touchend", this.onTouchEndListener);
        this.toggle.addEventListener("touchmove", this.onTouchEndListener);
      } else {
        this.onToggleClickListener = (evt) => this.toggleClick(evt);
        this.toggle.addEventListener("click", this.onToggleClickListener);
      }
    }
    buildMenu() {
      this.menu.role = this.menu.getAttribute("role") || "menu";
      this.menu.tabIndex = -1;
      const checkboxes = this.menu.querySelectorAll('[role="menuitemcheckbox"]');
      const radiobuttons = this.menu.querySelectorAll('[role="menuitemradio"]');
      checkboxes.forEach(
        (el) => el.addEventListener("click", () => this.selectCheckbox(el))
      );
      radiobuttons.forEach(
        (el) => el.addEventListener("click", () => this.selectRadio(el))
      );
      this.menu.addEventListener("click", (evt) => {
        const target = evt.target;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.tagName === "BUTTON" || target.tagName === "A" || target.closest("button") || target.closest("a") || target.closest("input") || target.closest("textarea") || target.closest("select")) {
          return;
        }
        this.menu.focus();
      });
    }
    buildClosers() {
      this.closers.forEach((el) => {
        this.onCloserClickListener.push({
          el,
          fn: () => this.closerClick()
        });
        el.addEventListener(
          "click",
          this.onCloserClickListener.find((closer) => closer.el === el).fn
        );
      });
    }
    getScrollbarSize() {
      let div = document.createElement("div");
      div.style.overflow = "scroll";
      div.style.width = "100px";
      div.style.height = "100px";
      document.body.appendChild(div);
      let scrollbarSize = div.offsetWidth - div.clientWidth;
      document.body.removeChild(div);
      return scrollbarSize;
    }
    onContextMenuHandler(evt) {
      const virtualElement = {
        getBoundingClientRect: () => new DOMRect()
      };
      virtualElement.getBoundingClientRect = () => new DOMRect(evt.clientX, evt.clientY, 0, 0);
      _HSDropdown.closeCurrentlyOpened();
      if (this.el.classList.contains("open") && !this.menu.classList.contains("hidden")) {
        this.close();
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      } else {
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${this.getScrollbarSize()}px`;
        this.open(virtualElement);
      }
    }
    onClickHandler(evt) {
      const isMouseHoverTrigger = this.eventMode === "hover" && window.matchMedia("(hover: hover)").matches && evt.pointerType === "mouse";
      if (isMouseHoverTrigger) {
        const el = evt.currentTarget;
        const isAnchor = el.tagName === "A";
        const isNavLink = isAnchor && el.hasAttribute("href") && el.getAttribute("href") !== "#";
        if (!isNavLink) {
          evt.preventDefault();
          evt.stopPropagation();
          evt.stopImmediatePropagation?.();
        }
        return false;
      }
      if (this.el.classList.contains("open") && !this.menu.classList.contains("hidden")) {
        this.close();
      } else {
        this.open();
      }
    }
    onMouseEnterHandler() {
      if (this.eventMode !== "hover") return false;
      if (!this.el._floatingUI || this.el._floatingUI && !this.el.classList.contains("open")) this.forceClearState();
      if (!this.el.classList.contains("open") && this.menu.classList.contains("hidden")) {
        this.open();
      }
    }
    onMouseLeaveHandler() {
      if (this.eventMode !== "hover") return false;
      if (this.el.classList.contains("open") && !this.menu.classList.contains("hidden")) {
        this.close();
      }
    }
    destroyFloatingUI() {
      const scope = (window.getComputedStyle(this.el).getPropertyValue("--scope") || "").trim();
      this.menu.classList.remove("block");
      this.menu.classList.add("hidden");
      this.menu.style.inset = null;
      this.menu.style.position = null;
      if (this.el && this.el._floatingUI) {
        this.el._floatingUI.destroy();
        this.el._floatingUI = null;
      }
      if (scope === "window") this.el.appendChild(this.menu);
      this.animationInProcess = false;
    }
    focusElement() {
      const input = this.menu.querySelector("[autofocus]");
      if (input) {
        input.focus();
        return true;
      }
      const menuItems = this.menu.querySelectorAll(
        'a:not([hidden]), button:not([hidden]), [role="menuitem"]:not([hidden])'
      );
      if (menuItems.length > 0) {
        const firstItem = menuItems[0];
        firstItem.focus();
        return true;
      }
      return false;
    }
    setupFloatingUI(target) {
      const _target = target || this.el;
      const computedStyle = window.getComputedStyle(this.el);
      const placementCss = (computedStyle.getPropertyValue("--placement") || "").trim();
      const flipCss = (computedStyle.getPropertyValue("--flip") || "true").trim();
      const strategyCss = (computedStyle.getPropertyValue("--strategy") || "fixed").trim();
      const offsetCss = (computedStyle.getPropertyValue("--offset") || "10").trim();
      const gpuAccelerationCss = (computedStyle.getPropertyValue("--gpu-acceleration") || "true").trim();
      const adaptive = (window.getComputedStyle(this.el).getPropertyValue("--adaptive") || "adaptive").replace(" ", "");
      const strategy = strategyCss;
      const offsetValue = parseInt(offsetCss, 10);
      const placement = POSITIONS[placementCss] || "bottom-start";
      const middleware = [
        ...flipCss === "true" ? [flip2()] : [],
        offset2(offsetValue)
      ];
      const options = {
        placement,
        strategy,
        middleware
      };
      const checkSpaceAndAdjust = (x) => {
        const menuRect = this.menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const availableWidth = viewportWidth - scrollbarWidth;
        if (x + menuRect.width > availableWidth) {
          x = availableWidth - menuRect.width;
        }
        if (x < 0) x = 0;
        return x;
      };
      const update2 = () => {
        computePosition2(_target, this.menu, options).then(
          ({ x, y, placement: computedPlacement }) => {
            const adjustedX = checkSpaceAndAdjust(x);
            if (strategy === "absolute" && adaptive === "none") {
              Object.assign(this.menu.style, {
                position: strategy,
                margin: "0"
              });
            } else if (strategy === "absolute") {
              Object.assign(this.menu.style, {
                position: strategy,
                transform: `translate3d(${x}px, ${y}px, 0px)`,
                margin: "0"
              });
            } else {
              if (gpuAccelerationCss === "true") {
                Object.assign(this.menu.style, {
                  position: strategy,
                  left: "",
                  top: "",
                  inset: "0px auto auto 0px",
                  margin: "0",
                  transform: `translate3d(${adaptive === "adaptive" ? adjustedX : 0}px, ${y}px, 0)`
                });
              } else {
                Object.assign(this.menu.style, {
                  position: strategy,
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: ""
                });
              }
            }
            this.menu.setAttribute("data-placement", computedPlacement);
          }
        );
      };
      update2();
      const cleanup = autoUpdate(_target, this.menu, update2);
      return {
        update: update2,
        destroy: cleanup
      };
    }
    selectCheckbox(target) {
      target.ariaChecked = target.ariaChecked === "true" ? "false" : "true";
    }
    selectRadio(target) {
      if (target.ariaChecked === "true") return false;
      const group = target.closest(".group");
      const items = group.querySelectorAll('[role="menuitemradio"]');
      const otherItems = Array.from(items).filter((el) => el !== target);
      otherItems.forEach((el) => {
        el.ariaChecked = "false";
      });
      target.ariaChecked = "true";
    }
    // Public methods
    // TODO:: rename "Popper" to "FLoatingUI"
    calculatePopperPosition(target) {
      const floatingUIInstance = this.setupFloatingUI(target);
      const floatingUIPosition = this.menu.getAttribute("data-placement");
      floatingUIInstance.update();
      floatingUIInstance.destroy();
      return floatingUIPosition;
    }
    open(target, openedViaKeyboard = false) {
      if (this.el.classList.contains("open") || this.animationInProcess) {
        return false;
      }
      this.openedViaKeyboard = openedViaKeyboard;
      this.animationInProcess = true;
      this.menu.style.cssText = "";
      const _target = target || this.el;
      const computedStyle = window.getComputedStyle(this.el);
      const scope = (computedStyle.getPropertyValue("--scope") || "").trim();
      const strategyCss = (computedStyle.getPropertyValue("--strategy") || "fixed").trim();
      const strategy = strategyCss;
      if (scope === "window") document.body.appendChild(this.menu);
      if (strategy !== "static") {
        this.el._floatingUI = this.setupFloatingUI(_target);
      }
      this.menu.style.margin = null;
      this.menu.classList.remove("hidden");
      this.menu.classList.add("block");
      setTimeout(() => {
        if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
        this.el.classList.add("open");
        if (window.HSAccessibilityObserver && this.accessibilityComponent) {
          window.HSAccessibilityObserver.updateComponentState(
            this.accessibilityComponent,
            true
          );
        }
        if (scope === "window") this.menu.classList.add("open");
        this.animationInProcess = false;
        if (this.hasAutofocus && (!this.autofocusOnKeyboardOnly || this.openedViaKeyboard)) this.focusElement();
        this.fireEvent("open", this.el);
        dispatch("open.hs.dropdown", this.el, this.el);
      });
    }
    close(isAnimated = true) {
      if (this.animationInProcess || !this.el.classList.contains("open")) {
        return false;
      }
      const scope = (window.getComputedStyle(this.el).getPropertyValue("--scope") || "").trim();
      const clearAfterClose = () => {
        this.menu.style.margin = null;
        if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
        this.el.classList.remove("open");
        this.openedViaKeyboard = false;
        this.fireEvent("close", this.el);
        dispatch("close.hs.dropdown", this.el, this.el);
      };
      this.animationInProcess = true;
      if (scope === "window") this.menu.classList.remove("open");
      if (window.HSAccessibilityObserver && this.accessibilityComponent) {
        window.HSAccessibilityObserver.updateComponentState(
          this.accessibilityComponent,
          false
        );
      }
      if (isAnimated) {
        const el = this.el.querySelector("[data-hs-dropdown-transition]") || this.menu;
        let hasCompleted = false;
        const completeClose = () => {
          if (hasCompleted) return;
          hasCompleted = true;
          this.destroyFloatingUI();
        };
        afterTransition(el, completeClose);
        const computedStyle = window.getComputedStyle(el);
        const transitionDuration = computedStyle.getPropertyValue(
          "transition-duration"
        );
        const duration = parseFloat(transitionDuration) * 1e3 || 150;
        setTimeout(completeClose, duration + 50);
      } else {
        this.destroyFloatingUI();
      }
      clearAfterClose();
    }
    forceClearState() {
      this.destroyFloatingUI();
      this.menu.style.margin = null;
      this.el.classList.remove("open");
      this.menu.classList.add("hidden");
      this.openedViaKeyboard = false;
    }
    destroy() {
      if (!isIOS() && !isIpadOS()) {
        this.el.removeEventListener(
          "mouseenter",
          this.onElementMouseEnterListener
        );
        this.el.removeEventListener(
          "mouseleave",
          () => this.onElementMouseLeaveListener
        );
        this.onElementMouseEnterListener = null;
        this.onElementMouseLeaveListener = null;
      }
      if (this.eventMode === "contextmenu") {
        if (this.toggle) {
          this.toggle.removeEventListener(
            "contextmenu",
            this.onToggleContextMenuListener
          );
          this.toggle.removeEventListener(
            "touchstart",
            this.onTouchStartListener
          );
          this.toggle.removeEventListener("touchend", this.onTouchEndListener);
          this.toggle.removeEventListener("touchmove", this.onTouchEndListener);
        }
        this.onToggleContextMenuListener = null;
        this.onTouchStartListener = null;
        this.onTouchEndListener = null;
      } else {
        if (this.toggle) {
          this.toggle.removeEventListener("click", this.onToggleClickListener);
        }
        this.onToggleClickListener = null;
      }
      if (this.closers.length) {
        this.closers.forEach((el) => {
          el.removeEventListener(
            "click",
            this.onCloserClickListener.find((closer) => closer.el === el).fn
          );
        });
        this.onCloserClickListener = null;
      }
      this.el.classList.remove("open");
      this.destroyFloatingUI();
      window.$hsDropdownCollection = window.$hsDropdownCollection.filter(({ element }) => element.el !== this.el);
    }
    // Static methods
    static findInCollection(target) {
      return window.$hsDropdownCollection.find((el) => {
        if (target instanceof _HSDropdown) return el.element.el === target.el;
        else if (typeof target === "string") {
          return el.element.el === document.querySelector(target);
        } else return el.element.el === target;
      }) || null;
    }
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsDropdownCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsDropdownCollection) {
        window.$hsDropdownCollection = [];
        window.addEventListener("click", (evt) => {
          const evtTarget = evt.target;
          _HSDropdown.closeCurrentlyOpened(evtTarget);
        });
        let prevWidth = window.innerWidth;
        window.addEventListener("resize", () => {
          if (window.innerWidth !== prevWidth) {
            prevWidth = innerWidth;
            _HSDropdown.closeCurrentlyOpened(null, false);
          }
        });
      }
      if (window.$hsDropdownCollection) {
        window.$hsDropdownCollection = window.$hsDropdownCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll(".hs-dropdown:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsDropdownCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          new _HSDropdown(el);
        }
      });
    }
    static open(target, openedViaKeyboard = false) {
      const instance = _HSDropdown.findInCollection(target);
      if (instance && instance.element.menu.classList.contains("hidden")) instance.element.open(void 0, openedViaKeyboard);
    }
    static close(target) {
      const instance = _HSDropdown.findInCollection(target);
      if (instance && !instance.element.menu.classList.contains("hidden")) instance.element.close();
    }
    static closeCurrentlyOpened(evtTarget = null, isAnimated = true) {
      const parent = evtTarget && evtTarget.closest(".hs-dropdown") && evtTarget.closest(".hs-dropdown").parentElement.closest(".hs-dropdown") ? evtTarget.closest(".hs-dropdown").parentElement.closest(".hs-dropdown") : null;
      let currentlyOpened = parent ? window.$hsDropdownCollection.filter(
        (el) => el.element.el.classList.contains("open") && el.element.menu.closest(".hs-dropdown").parentElement.closest(".hs-dropdown") === parent
      ) : window.$hsDropdownCollection.filter(
        (el) => el.element.el.classList.contains("open")
      );
      if (evtTarget) {
        const dropdownElement = evtTarget.closest(".hs-dropdown");
        if (dropdownElement) {
          if (getClassPropertyAlt(dropdownElement, "--auto-close") === "inside") {
            currentlyOpened = currentlyOpened.filter(
              (el) => el.element.el !== dropdownElement
            );
          }
        } else {
          const dropdownMenu = evtTarget.closest(".hs-dropdown-menu");
          if (dropdownMenu) {
            const originalDropdown = window.$hsDropdownCollection.find(
              (item) => item.element.menu === dropdownMenu
            );
            if (originalDropdown && getClassPropertyAlt(originalDropdown.element.el, "--auto-close") === "inside") {
              currentlyOpened = currentlyOpened.filter(
                (el) => el.element.el !== originalDropdown.element.el
              );
            }
          }
        }
      }
      if (currentlyOpened) {
        currentlyOpened.forEach((el) => {
          if (el.element.closeMode === "false" || el.element.closeMode === "outside") {
            return false;
          }
          el.element.close(isAnimated);
        });
      }
      if (currentlyOpened) {
        currentlyOpened.forEach((el) => {
          if (getClassPropertyAlt(el.element.el, "--trigger") !== "contextmenu") {
            return false;
          }
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
        });
      }
    }
    // Accessibility methods
    setupAccessibility() {
      this.accessibilityComponent = window.HSAccessibilityObserver.registerComponent(
        this.el,
        {
          onEnter: () => {
            if (!this.isOpened()) this.open(void 0, true);
          },
          onSpace: () => {
            if (!this.isOpened()) this.open(void 0, true);
          },
          onEsc: () => {
            if (this.isOpened()) {
              this.close();
              if (this.toggle) this.toggle.focus();
            }
          },
          onArrow: (evt) => {
            if (evt.metaKey) return;
            switch (evt.key) {
              case "ArrowDown":
                if (!this.isOpened()) this.open(void 0, true);
                else this.focusMenuItem("next");
                break;
              case "ArrowUp":
                if (this.isOpened()) this.focusMenuItem("prev");
                break;
              case "ArrowRight":
                this.onArrowX(evt, "right");
                break;
              case "ArrowLeft":
                this.onArrowX(evt, "left");
                break;
            }
          },
          onHome: () => {
            if (this.isOpened()) this.onStartEnd(true);
          },
          onEnd: () => {
            if (this.isOpened()) this.onStartEnd(false);
          },
          onTab: () => {
            if (this.isOpened()) this.close();
          },
          onFirstLetter: (key) => {
            if (this.isOpened()) this.onFirstLetter(key);
          }
        },
        this.isOpened(),
        "Dropdown",
        ".hs-dropdown",
        this.menu
      );
    }
    onFirstLetter(key) {
      if (!this.isOpened() || !this.menu) return;
      const menuItems = this.menu.querySelectorAll(
        'a:not([hidden]), button:not([hidden]), [role="menuitem"]:not([hidden])'
      );
      if (menuItems.length === 0) return;
      const currentIndex = Array.from(menuItems).indexOf(
        document.activeElement
      );
      for (let i = 1; i <= menuItems.length; i++) {
        const index = (currentIndex + i) % menuItems.length;
        const text = menuItems[index].textContent?.trim().toLowerCase() || "";
        if (text.startsWith(key.toLowerCase())) {
          menuItems[index].focus();
          return;
        }
      }
      menuItems[0].focus();
    }
    onArrowX(evt, direction) {
      if (!this.isOpened()) return;
      evt.preventDefault();
      evt.stopImmediatePropagation();
      const menuItems = this.menu.querySelectorAll(
        'a:not([hidden]), button:not([hidden]), [role="menuitem"]:not([hidden])'
      );
      if (!menuItems.length) return;
      const currentIndex = Array.from(menuItems).indexOf(
        document.activeElement
      );
      let nextIndex = -1;
      if (direction === "right") {
        nextIndex = (currentIndex + 1) % menuItems.length;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
      }
      menuItems[nextIndex].focus();
    }
    onStartEnd(toStart = true) {
      if (!this.isOpened()) return;
      const menuItems = this.menu.querySelectorAll(
        'a:not([hidden]), button:not([hidden]), [role="menuitem"]:not([hidden])'
      );
      if (!menuItems.length) return;
      const index = toStart ? 0 : menuItems.length - 1;
      menuItems[index].focus();
    }
    focusMenuItem(direction) {
      const menuItems = this.menu.querySelectorAll(
        'a:not([hidden]), button:not([hidden]), [role="menuitem"]:not([hidden])'
      );
      if (!menuItems.length) return;
      const currentIndex = Array.from(menuItems).indexOf(
        document.activeElement
      );
      const nextIndex = direction === "next" ? (currentIndex + 1) % menuItems.length : (currentIndex - 1 + menuItems.length) % menuItems.length;
      menuItems[nextIndex].focus();
    }
    // Backward compatibility
    static on(evt, target, cb) {
      const instance = _HSDropdown.findInCollection(target);
      if (instance) instance.element.events[evt] = cb;
    }
    isOpened() {
      return this.isOpen();
    }
    containsElement(element) {
      return this.el.contains(element);
    }
  };
  window.addEventListener("load", () => {
    HSDropdown.autoInit();
  });
  window.addEventListener("resize", () => {
    if (!window.$hsDropdownCollection) window.$hsDropdownCollection = [];
    window.$hsDropdownCollection.forEach((el) => el.element.resizeHandler());
  });
  if (typeof window !== "undefined") {
    window.HSDropdown = HSDropdown;
  }
  var dropdown_default = HSDropdown;

  // node_modules/preline/src/plugins/input-number/index.ts
  init_utils();
  init_base_plugin();
  var HSInputNumber = class _HSInputNumber extends HSBasePlugin {
    input;
    increment;
    decrement;
    inputValue;
    minInputValue;
    maxInputValue;
    step;
    onInputInputListener;
    onIncrementClickListener;
    onDecrementClickListener;
    constructor(el, options) {
      super(el, options);
      this.input = this.el.querySelector("[data-hs-input-number-input]") || null;
      this.increment = this.el.querySelector("[data-hs-input-number-increment]") || null;
      this.decrement = this.el.querySelector("[data-hs-input-number-decrement]") || null;
      if (this.input) this.checkIsNumberAndConvert();
      const data = this.el.dataset.hsInputNumber;
      const dataOptions = data ? JSON.parse(data) : { step: 1 };
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.minInputValue = "min" in concatOptions ? concatOptions.min : 0;
      this.maxInputValue = "max" in concatOptions ? concatOptions.max : null;
      this.step = "step" in concatOptions && concatOptions.step > 0 ? concatOptions.step : 1;
      this.init();
    }
    inputInput() {
      this.changeValue();
    }
    incrementClick() {
      this.changeValue("increment");
    }
    decrementClick() {
      this.changeValue("decrement");
    }
    init() {
      this.createCollection(window.$hsInputNumberCollection, this);
      if (this.input && this.increment) this.build();
    }
    checkIsNumberAndConvert() {
      const value = this.input.value.trim();
      const cleanedValue = this.cleanAndExtractNumber(value);
      if (cleanedValue !== null) {
        this.inputValue = cleanedValue;
        this.input.value = cleanedValue.toString();
      } else {
        this.inputValue = 0;
        this.input.value = "0";
      }
    }
    cleanAndExtractNumber(value) {
      const cleanedArray = [];
      let decimalFound = false;
      value.split("").forEach((char) => {
        if (char >= "0" && char <= "9") cleanedArray.push(char);
        else if (char === "." && !decimalFound) {
          cleanedArray.push(char);
          decimalFound = true;
        }
      });
      const cleanedValue = cleanedArray.join("");
      const number = parseFloat(cleanedValue);
      return isNaN(number) ? null : number;
    }
    build() {
      if (this.input) this.buildInput();
      if (this.increment) this.buildIncrement();
      if (this.decrement) this.buildDecrement();
      if (this.inputValue <= this.minInputValue) {
        this.inputValue = this.minInputValue;
        this.input.value = `${this.minInputValue}`;
      }
      if (this.inputValue <= this.minInputValue) this.changeValue();
      if (this.input.hasAttribute("disabled")) this.disableButtons();
    }
    buildInput() {
      this.onInputInputListener = () => this.inputInput();
      this.input.addEventListener("input", this.onInputInputListener);
    }
    buildIncrement() {
      this.onIncrementClickListener = () => this.incrementClick();
      this.increment.addEventListener("click", this.onIncrementClickListener);
    }
    buildDecrement() {
      this.onDecrementClickListener = () => this.decrementClick();
      this.decrement.addEventListener("click", this.onDecrementClickListener);
    }
    changeValue(event = "none") {
      const payload = { inputValue: this.inputValue };
      const minInputValue = this.minInputValue ?? Number.MIN_SAFE_INTEGER;
      const maxInputValue = this.maxInputValue ?? Number.MAX_SAFE_INTEGER;
      this.inputValue = isNaN(this.inputValue) ? 0 : this.inputValue;
      switch (event) {
        case "increment":
          const incrementedResult = this.inputValue + this.step;
          this.inputValue = incrementedResult >= minInputValue && incrementedResult <= maxInputValue ? incrementedResult : maxInputValue;
          this.input.value = this.inputValue.toString();
          break;
        case "decrement":
          const decrementedResult = this.inputValue - this.step;
          this.inputValue = decrementedResult >= minInputValue && decrementedResult <= maxInputValue ? decrementedResult : minInputValue;
          this.input.value = this.inputValue.toString();
          break;
        default:
          const defaultResult = isNaN(parseInt(this.input.value)) ? 0 : parseInt(this.input.value);
          this.inputValue = defaultResult >= maxInputValue ? maxInputValue : defaultResult <= minInputValue ? minInputValue : defaultResult;
          if (this.inputValue <= minInputValue)
            this.input.value = this.inputValue.toString();
          break;
      }
      payload.inputValue = this.inputValue;
      if (this.inputValue === minInputValue) {
        this.el.classList.add("disabled");
        if (this.decrement) this.disableButtons("decrement");
      } else {
        this.el.classList.remove("disabled");
        if (this.decrement) this.enableButtons("decrement");
      }
      if (this.inputValue === maxInputValue) {
        this.el.classList.add("disabled");
        if (this.increment) this.disableButtons("increment");
      } else {
        this.el.classList.remove("disabled");
        if (this.increment) this.enableButtons("increment");
      }
      this.fireEvent("change", payload);
      dispatch("change.hs.inputNumber", this.el, payload);
    }
    disableButtons(mode = "all") {
      if (mode === "all") {
        if (this.increment.tagName === "BUTTON" || this.increment.tagName === "INPUT")
          this.increment.setAttribute("disabled", "disabled");
        if (this.decrement.tagName === "BUTTON" || this.decrement.tagName === "INPUT")
          this.decrement.setAttribute("disabled", "disabled");
      } else if (mode === "increment") {
        if (this.increment.tagName === "BUTTON" || this.increment.tagName === "INPUT")
          this.increment.setAttribute("disabled", "disabled");
      } else if (mode === "decrement") {
        if (this.decrement.tagName === "BUTTON" || this.decrement.tagName === "INPUT")
          this.decrement.setAttribute("disabled", "disabled");
      }
    }
    enableButtons(mode = "all") {
      if (mode === "all") {
        if (this.increment.tagName === "BUTTON" || this.increment.tagName === "INPUT")
          this.increment.removeAttribute("disabled");
        if (this.decrement.tagName === "BUTTON" || this.decrement.tagName === "INPUT")
          this.decrement.removeAttribute("disabled");
      } else if (mode === "increment") {
        if (this.increment.tagName === "BUTTON" || this.increment.tagName === "INPUT")
          this.increment.removeAttribute("disabled");
      } else if (mode === "decrement") {
        if (this.decrement.tagName === "BUTTON" || this.decrement.tagName === "INPUT")
          this.decrement.removeAttribute("disabled");
      }
    }
    // Public methods
    destroy() {
      this.el.classList.remove("disabled");
      this.increment.removeAttribute("disabled");
      this.decrement.removeAttribute("disabled");
      this.input.removeEventListener("input", this.onInputInputListener);
      this.increment.removeEventListener("click", this.onIncrementClickListener);
      this.decrement.removeEventListener("click", this.onDecrementClickListener);
      window.$hsInputNumberCollection = window.$hsInputNumberCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Global method
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsInputNumberCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsInputNumberCollection) window.$hsInputNumberCollection = [];
      if (window.$hsInputNumberCollection)
        window.$hsInputNumberCollection = window.$hsInputNumberCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll("[data-hs-input-number]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsInputNumberCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSInputNumber(el);
      });
    }
  };
  window.addEventListener("load", () => {
    HSInputNumber.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSInputNumber = HSInputNumber;
  }
  var input_number_default = HSInputNumber;

  // node_modules/preline/src/plugins/layout-splitter/index.ts
  init_utils();
  init_base_plugin();
  var HSLayoutSplitter = class _HSLayoutSplitter extends HSBasePlugin {
    static isListenersInitialized = false;
    horizontalSplitterClasses;
    horizontalSplitterTemplate;
    verticalSplitterClasses;
    verticalSplitterTemplate;
    isSplittersAddedManually;
    horizontalSplitters;
    horizontalControls;
    verticalSplitters;
    verticalControls;
    isDragging;
    activeSplitter;
    onControlPointerDownListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-layout-splitter");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.horizontalSplitterClasses = concatOptions?.horizontalSplitterClasses || null;
      this.horizontalSplitterTemplate = concatOptions?.horizontalSplitterTemplate || "<div></div>";
      this.verticalSplitterClasses = concatOptions?.verticalSplitterClasses || null;
      this.verticalSplitterTemplate = concatOptions?.verticalSplitterTemplate || "<div></div>";
      this.isSplittersAddedManually = concatOptions?.isSplittersAddedManually ?? false;
      this.horizontalSplitters = [];
      this.horizontalControls = [];
      this.verticalSplitters = [];
      this.verticalControls = [];
      this.isDragging = false;
      this.activeSplitter = null;
      this.onControlPointerDownListener = [];
      this.init();
    }
    controlPointerDown(item) {
      this.isDragging = true;
      this.activeSplitter = item;
      this.onPointerDownHandler(item);
    }
    controlPointerUp() {
      this.isDragging = false;
      this.activeSplitter = null;
      this.onPointerUpHandler();
    }
    static onDocumentPointerMove = (evt) => {
      const draggingElement = document.querySelector(
        ".hs-layout-splitter-control.dragging"
      );
      if (!draggingElement) return;
      const draggingInstance = _HSLayoutSplitter.getInstance(
        draggingElement.closest("[data-hs-layout-splitter]"),
        true
      );
      if (!draggingInstance || !draggingInstance.element.isDragging) return;
      const activeSplitter = draggingInstance.element.activeSplitter;
      if (!activeSplitter) return;
      if (activeSplitter.direction === "vertical")
        draggingInstance.element.onPointerMoveHandler(
          evt,
          activeSplitter,
          "vertical"
        );
      else
        draggingInstance.element.onPointerMoveHandler(
          evt,
          activeSplitter,
          "horizontal"
        );
    };
    static onDocumentPointerUp = () => {
      const draggingElement = document.querySelector(
        ".hs-layout-splitter-control.dragging"
      );
      if (!draggingElement) return;
      const draggingInstance = _HSLayoutSplitter.getInstance(
        draggingElement.closest("[data-hs-layout-splitter]"),
        true
      );
      if (draggingInstance) draggingInstance.element.controlPointerUp();
    };
    init() {
      this.createCollection(window.$hsLayoutSplitterCollection, this);
      this.buildSplitters();
      if (!_HSLayoutSplitter.isListenersInitialized) {
        document.addEventListener(
          "pointermove",
          _HSLayoutSplitter.onDocumentPointerMove
        );
        document.addEventListener(
          "pointerup",
          _HSLayoutSplitter.onDocumentPointerUp
        );
        _HSLayoutSplitter.isListenersInitialized = true;
      }
    }
    buildSplitters() {
      this.buildHorizontalSplitters();
      this.buildVerticalSplitters();
    }
    buildHorizontalSplitters() {
      const groups = this.el.querySelectorAll(
        "[data-hs-layout-splitter-horizontal-group]"
      );
      if (groups.length) {
        groups.forEach((el) => {
          this.horizontalSplitters.push({
            el,
            items: Array.from(
              el.querySelectorAll(":scope > [data-hs-layout-splitter-item]")
            )
          });
        });
        this.updateHorizontalSplitter();
      }
    }
    buildVerticalSplitters() {
      const groups = this.el.querySelectorAll(
        "[data-hs-layout-splitter-vertical-group]"
      );
      if (groups.length) {
        groups.forEach((el) => {
          this.verticalSplitters.push({
            el,
            items: Array.from(
              el.querySelectorAll(":scope > [data-hs-layout-splitter-item]")
            )
          });
        });
        this.updateVerticalSplitter();
      }
    }
    buildControl(prev, next, direction = "horizontal") {
      let el;
      if (this.isSplittersAddedManually) {
        el = next?.previousElementSibling;
        if (!el) return false;
        el.style.display = "";
      } else {
        el = htmlToElement(direction === "horizontal" ? this.horizontalSplitterTemplate : this.verticalSplitterTemplate);
        classToClassList(direction === "horizontal" ? this.horizontalSplitterClasses : this.verticalSplitterClasses, el);
        el.classList.add("hs-layout-splitter-control");
      }
      const item = { el, direction, prev, next };
      if (direction === "horizontal") this.horizontalControls.push(item);
      else this.verticalControls.push(item);
      this.bindListeners(item);
      if (next && !this.isSplittersAddedManually) prev.insertAdjacentElement("afterend", el);
    }
    getSplitterItemParsedParam(item) {
      const param = item.getAttribute("data-hs-layout-splitter-item");
      return isJson(param) ? JSON.parse(param) : param;
    }
    getContainerSize(container, isHorizontal) {
      return isHorizontal ? container.getBoundingClientRect().width : container.getBoundingClientRect().height;
    }
    getMaxFlexSize(element, param, totalWidth) {
      const paramValue = this.getSplitterItemSingleParam(element, param);
      return typeof paramValue === "number" ? paramValue / 100 * totalWidth : 0;
    }
    updateHorizontalSplitter() {
      this.horizontalSplitters.forEach(({ items }) => {
        items.forEach((el) => {
          this.updateSingleSplitter(el);
        });
        items.forEach((el, index) => {
          if (index >= items.length - 1) this.buildControl(el, null);
          else this.buildControl(el, items[index + 1]);
        });
      });
    }
    updateSingleSplitter(el) {
      const param = el.getAttribute("data-hs-layout-splitter-item");
      const parsedParam = isJson(param) ? JSON.parse(param) : param;
      const width = isJson(param) ? parsedParam.dynamicSize : param;
      el.style.flex = `${width} 1 0`;
    }
    updateVerticalSplitter() {
      this.verticalSplitters.forEach(({ items }) => {
        items.forEach((el) => {
          this.updateSingleSplitter(el);
        });
        items.forEach((el, index) => {
          if (index >= items.length - 1) this.buildControl(el, null, "vertical");
          else this.buildControl(el, items[index + 1], "vertical");
        });
      });
    }
    updateSplitterItemParam(item, newSize) {
      const param = this.getSplitterItemParsedParam(item);
      const newSizeFixed = newSize.toFixed(1);
      const newParam = typeof param === "object" ? JSON.stringify({
        ...param,
        dynamicSize: +newSizeFixed
      }) : newSizeFixed;
      item.setAttribute(
        "data-hs-layout-splitter-item",
        newParam
      );
    }
    onPointerDownHandler(item) {
      const { el, prev, next } = item;
      el.classList.add("dragging");
      prev.classList.add("dragging");
      next.classList.add("dragging");
      document.body.style.userSelect = "none";
    }
    onPointerUpHandler() {
      document.body.style.userSelect = "";
    }
    onPointerMoveHandler(evt, item, direction) {
      const { prev, next } = item;
      const container = item.el.closest(
        direction === "horizontal" ? "[data-hs-layout-splitter-horizontal-group]" : "[data-hs-layout-splitter-vertical-group]"
      );
      const isHorizontal = direction === "horizontal";
      const totalSize = this.getContainerSize(container, isHorizontal);
      const availableSize = this.calculateAvailableSize(container, prev, next, isHorizontal, totalSize);
      const sizes = this.calculateResizedSizes(evt, prev, availableSize, isHorizontal);
      const adjustedSizes = this.enforceLimits(sizes, prev, next, totalSize, availableSize);
      this.applySizes(prev, next, adjustedSizes, totalSize);
    }
    bindListeners(item) {
      const { el } = item;
      this.onControlPointerDownListener.push({
        el,
        fn: () => this.controlPointerDown(item)
      });
      el.addEventListener(
        "pointerdown",
        this.onControlPointerDownListener.find((control) => control.el === el).fn
      );
    }
    calculateAvailableSize(container, prev, next, isHorizontal, totalSize) {
      const items = container.querySelectorAll(":scope > [data-hs-layout-splitter-item]");
      const otherSize = Array.from(items).reduce((sum, item) => {
        if (item === prev || item === next) return sum;
        const rect = item.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(item);
        return sum + (computedStyle.position === "fixed" ? 0 : isHorizontal ? rect.width : rect.height);
      }, 0);
      return totalSize - otherSize;
    }
    calculateResizedSizes(evt, prev, availableSize, isHorizontal) {
      const prevStart = isHorizontal ? prev.getBoundingClientRect().left : prev.getBoundingClientRect().top;
      let previousSize = Math.max(0, Math.min((isHorizontal ? evt.clientX : evt.clientY) - prevStart, availableSize));
      let nextSize = availableSize - previousSize;
      return { previousSize, nextSize };
    }
    enforceLimits(sizes, prev, next, totalSize, availableSize) {
      const prevMinSize = this.getMaxFlexSize(prev, "minSize", totalSize);
      const nextMinSize = this.getMaxFlexSize(next, "minSize", totalSize);
      const prevPreLimitSize = this.getMaxFlexSize(prev, "preLimitSize", totalSize);
      const nextPreLimitSize = this.getMaxFlexSize(next, "preLimitSize", totalSize);
      let { previousSize, nextSize } = sizes;
      if (nextSize < nextMinSize) {
        nextSize = nextMinSize;
        previousSize = availableSize - nextSize;
      } else if (previousSize < prevMinSize) {
        previousSize = prevMinSize;
        nextSize = availableSize - previousSize;
      }
      const payload = {
        prev,
        next,
        previousSize: previousSize.toFixed(),
        previousFlexSize: previousSize / totalSize * 100,
        previousPreLimitSize: prevPreLimitSize,
        previousPreLimitFlexSize: prevPreLimitSize / totalSize * 100,
        previousMinSize: prevMinSize,
        previousMinFlexSize: prevMinSize / totalSize * 100,
        nextSize: nextSize.toFixed(),
        nextFlexSize: nextSize / totalSize * 100,
        nextPreLimitSize,
        nextPreLimitFlexSize: nextPreLimitSize / totalSize * 100,
        nextMinSize,
        nextMinFlexSize: nextMinSize / totalSize * 100,
        static: {
          prev: {
            minSize: this.getSplitterItemSingleParam(prev, "minSize"),
            preLimitSize: this.getSplitterItemSingleParam(prev, "preLimitSize")
          },
          next: {
            minSize: this.getSplitterItemSingleParam(next, "minSize"),
            preLimitSize: this.getSplitterItemSingleParam(next, "preLimitSize")
          }
        }
      };
      if (nextSize < nextMinSize) {
        this.fireEvent("onNextLimit", payload);
        dispatch("onNextLimit.hs.layoutSplitter", this.el, payload);
      } else if (previousSize < prevMinSize) {
        this.fireEvent("onPrevLimit", payload);
        dispatch("onPrevLimit.hs.layoutSplitter", this.el, payload);
      }
      if (previousSize <= prevPreLimitSize) {
        this.fireEvent("onPrevPreLimit", payload);
        dispatch("onPrevPreLimit.hs.layoutSplitter", this.el, payload);
      }
      if (nextSize <= nextPreLimitSize) {
        this.fireEvent("onNextPreLimit", payload);
        dispatch("onNextPreLimit.hs.layoutSplitter", this.el, payload);
      }
      this.fireEvent("drag", payload);
      dispatch("drag.hs.layoutSplitter", this.el, payload);
      return { previousSize, nextSize };
    }
    applySizes(prev, next, sizes, totalSize) {
      const { previousSize, nextSize } = sizes;
      const prevPercent = previousSize / totalSize * 100;
      this.updateSplitterItemParam(prev, prevPercent);
      prev.style.flex = `${prevPercent.toFixed(1)} 1 0`;
      const nextPercent = nextSize / totalSize * 100;
      this.updateSplitterItemParam(next, nextPercent);
      next.style.flex = `${nextPercent.toFixed(1)} 1 0`;
    }
    // Public methods
    getSplitterItemSingleParam(item, name) {
      try {
        const param = this.getSplitterItemParsedParam(item);
        return param[name];
      } catch {
        console.log("There is no parameter with this name in the object.");
        return false;
      }
    }
    getData(el) {
      const container = el.closest("[data-hs-layout-splitter-horizontal-group], [data-hs-layout-splitter-vertical-group]");
      if (!container) {
        throw new Error("Element is not inside a valid layout splitter container.");
      }
      const isHorizontal = container.matches("[data-hs-layout-splitter-horizontal-group]");
      const totalSize = this.getContainerSize(container, isHorizontal);
      const dynamicFlexSize = this.getSplitterItemSingleParam(el, "dynamicSize") || 0;
      const minSize = this.getMaxFlexSize(el, "minSize", totalSize);
      const preLimitSize = this.getMaxFlexSize(el, "preLimitSize", totalSize);
      const dynamicSize = dynamicFlexSize / 100 * totalSize;
      const minFlexSize = minSize / totalSize * 100;
      const preLimitFlexSize = preLimitSize / totalSize * 100;
      return {
        el,
        dynamicSize: +dynamicSize.toFixed(),
        dynamicFlexSize,
        minSize: +minSize.toFixed(),
        minFlexSize,
        preLimitSize: +preLimitSize.toFixed(),
        preLimitFlexSize,
        static: {
          minSize: this.getSplitterItemSingleParam(el, "minSize") ?? null,
          preLimitSize: this.getSplitterItemSingleParam(el, "preLimitSize") ?? null
        }
      };
    }
    setSplitterItemSize(el, size2) {
      this.updateSplitterItemParam(el, size2);
      el.style.flex = `${size2.toFixed(1)} 1 0`;
    }
    updateFlexValues(data) {
      let totalFlex = 0;
      const currentWidth = window.innerWidth;
      const getBreakpointValue = (breakpoints) => {
        const sortedBreakpoints = Object.keys(breakpoints).map(Number).sort((a, b) => a - b);
        for (let i = sortedBreakpoints.length - 1; i >= 0; i--) {
          if (currentWidth >= sortedBreakpoints[i]) {
            return breakpoints[sortedBreakpoints[i]];
          }
        }
        return 0;
      };
      data.forEach(({ id, breakpoints }) => {
        const item = document.getElementById(id);
        if (item) {
          const flexValue = getBreakpointValue(breakpoints);
          this.updateSplitterItemParam(item, flexValue);
          item.style.flex = `${flexValue.toFixed(1)} 1 0`;
          totalFlex += flexValue;
        }
      });
      if (totalFlex !== 100) {
        const scaleFactor = 100 / totalFlex;
        data.forEach(({ id }) => {
          const item = document.getElementById(id);
          if (item) {
            const currentFlex = parseFloat(item.style.flex.split(" ")[0]);
            const adjustedFlex = currentFlex * scaleFactor;
            this.updateSplitterItemParam(item, adjustedFlex);
            item.style.flex = `${adjustedFlex.toFixed(1)} 1 0`;
          }
        });
      }
    }
    destroy() {
      if (this.onControlPointerDownListener) {
        this.onControlPointerDownListener.forEach(({ el, fn }) => {
          el.removeEventListener("pointerdown", fn);
        });
        this.onControlPointerDownListener = null;
      }
      this.horizontalSplitters.forEach(({ items }) => {
        items.forEach((el) => {
          el.style.flex = "";
        });
      });
      this.verticalSplitters.forEach(({ items }) => {
        items.forEach((el) => {
          el.style.flex = "";
        });
      });
      this.horizontalControls.forEach(({ el }) => {
        if (this.isSplittersAddedManually) el.style.display = "none";
        else el.remove();
      });
      this.verticalControls.forEach(({ el }) => {
        if (this.isSplittersAddedManually) el.style.display = "none";
        else el.remove();
      });
      this.horizontalControls = [];
      this.verticalControls = [];
      window.$hsLayoutSplitterCollection = window.$hsLayoutSplitterCollection.filter(
        ({ element }) => element.el !== this.el
      );
      if (window.$hsLayoutSplitterCollection.length === 0 && _HSLayoutSplitter.isListenersInitialized) {
        document.removeEventListener(
          "pointermove",
          _HSLayoutSplitter.onDocumentPointerMove
        );
        document.removeEventListener(
          "pointerup",
          _HSLayoutSplitter.onDocumentPointerUp
        );
        _HSLayoutSplitter.isListenersInitialized = false;
      }
    }
    // Static method
    static findInCollection(target) {
      return window.$hsLayoutSplitterCollection.find((el) => {
        if (target instanceof _HSLayoutSplitter) return el.element.el === target.el;
        else if (typeof target === "string") return el.element.el === document.querySelector(target);
        else return el.element.el === target;
      }) || null;
    }
    static autoInit() {
      if (!window.$hsLayoutSplitterCollection) {
        window.$hsLayoutSplitterCollection = [];
        window.addEventListener("pointerup", () => {
          if (!window.$hsLayoutSplitterCollection) return false;
          const draggingElement = document.querySelector(
            ".hs-layout-splitter-control.dragging"
          );
          const draggingSections = document.querySelectorAll(
            "[data-hs-layout-splitter-item].dragging"
          );
          if (!draggingElement) return false;
          const draggingInstance = _HSLayoutSplitter.getInstance(
            draggingElement.closest("[data-hs-layout-splitter]"),
            true
          );
          draggingElement.classList.remove("dragging");
          draggingSections.forEach((el) => el.classList.remove("dragging"));
          draggingInstance.element.isDragging = false;
        });
      }
      if (window.$hsLayoutSplitterCollection)
        window.$hsLayoutSplitterCollection = window.$hsLayoutSplitterCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll(
        "[data-hs-layout-splitter]:not(.--prevent-on-load-init)"
      ).forEach((el) => {
        if (!window.$hsLayoutSplitterCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSLayoutSplitter(el);
      });
    }
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsLayoutSplitterCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static on(evt, target, cb) {
      const instance = _HSLayoutSplitter.findInCollection(target);
      if (instance) instance.element.events[evt] = cb;
    }
  };
  window.addEventListener("load", () => {
    HSLayoutSplitter.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSLayoutSplitter = HSLayoutSplitter;
  }
  var layout_splitter_default = HSLayoutSplitter;

  // node_modules/preline/src/plugins/overlay/index.ts
  init_utils();
  init_constants();
  init_base_plugin();
  init_accessibility_manager();
  var HSOverlay = class _HSOverlay extends HSBasePlugin {
    accessibilityComponent;
    lastFocusedToggle = null;
    initiallyOpened;
    hiddenClass;
    emulateScrollbarSpace;
    isClosePrev;
    backdropClasses;
    backdropParent;
    backdropExtraClasses;
    animationTarget;
    openNextOverlay;
    autoHide;
    toggleButtons;
    toggleMinifierButtons;
    static openedItemsQty = 0;
    initContainer;
    isCloseWhenClickInside;
    isTabAccessibilityLimited;
    isLayoutAffect;
    hasAutofocus;
    hasDynamicZIndex;
    hasAbilityToCloseOnBackdropClick;
    openedBreakpoint;
    autoClose;
    autoCloseEqualityType;
    moveOverlayToBody;
    backdrop;
    initialZIndex = 0;
    static currentZIndex = 0;
    onElementClickListener;
    onElementMinifierClickListener;
    onOverlayClickListener;
    onBackdropClickListener;
    constructor(el, options, events) {
      super(el, options, events);
      this.toggleButtons = Array.from(
        document.querySelectorAll(`[data-hs-overlay="#${this.el.id}"]`)
      );
      const toggleDataOptions = this.collectToggleParameters(this.toggleButtons);
      this.toggleMinifierButtons = Array.from(
        document.querySelectorAll(`[data-hs-overlay-minifier="#${this.el.id}"]`)
      );
      const data = el.getAttribute("data-hs-overlay-options");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...toggleDataOptions,
        ...options
      };
      this.hiddenClass = concatOptions?.hiddenClass || "hidden";
      this.emulateScrollbarSpace = concatOptions?.emulateScrollbarSpace || false;
      this.isClosePrev = concatOptions?.isClosePrev ?? true;
      this.backdropClasses = concatOptions?.backdropClasses ?? "hs-overlay-backdrop transition duration fixed inset-0 bg-gray-900/50 dark:bg-neutral-900/80";
      this.backdropParent = typeof concatOptions.backdropParent === "string" ? document.querySelector(concatOptions.backdropParent) : document.body;
      this.backdropExtraClasses = concatOptions?.backdropExtraClasses ?? "";
      this.moveOverlayToBody = concatOptions?.moveOverlayToBody || null;
      this.openNextOverlay = false;
      this.autoHide = null;
      this.initContainer = this.el?.parentElement || null;
      this.isCloseWhenClickInside = stringToBoolean(
        getClassProperty(this.el, "--close-when-click-inside", "false") || "false"
      );
      this.isTabAccessibilityLimited = stringToBoolean(
        getClassProperty(this.el, "--tab-accessibility-limited", "true") || "true"
      );
      this.isLayoutAffect = stringToBoolean(
        getClassProperty(this.el, "--is-layout-affect", "false") || "false"
      );
      this.hasAutofocus = stringToBoolean(
        getClassProperty(this.el, "--has-autofocus", "true") || "true"
      );
      this.hasDynamicZIndex = stringToBoolean(
        getClassProperty(this.el, "--has-dynamic-z-index", "false") || "false"
      );
      this.hasAbilityToCloseOnBackdropClick = stringToBoolean(
        this.el.getAttribute("data-hs-overlay-keyboard") || "true"
      );
      const autoCloseBreakpoint = getClassProperty(this.el, "--auto-close");
      const autoCloseEqualityType = getClassProperty(
        this.el,
        "--auto-close-equality-type"
      );
      const openedBreakpoint = getClassProperty(this.el, "--opened");
      this.autoClose = !isNaN(+autoCloseBreakpoint) && isFinite(+autoCloseBreakpoint) ? +autoCloseBreakpoint : BREAKPOINTS[autoCloseBreakpoint] || null;
      this.autoCloseEqualityType = autoCloseEqualityType ?? null;
      this.openedBreakpoint = (!isNaN(+openedBreakpoint) && isFinite(+openedBreakpoint) ? +openedBreakpoint : BREAKPOINTS[openedBreakpoint]) || null;
      this.animationTarget = this?.el?.querySelector(".hs-overlay-animation-target") || this.el;
      this.initialZIndex = parseInt(getComputedStyle(this.el).zIndex, 10);
      this.onElementClickListener = [];
      this.onElementMinifierClickListener = [];
      this.initiallyOpened = document.body.classList.contains(
        "hs-overlay-body-open"
      );
      this.init();
    }
    elementClick() {
      const payloadFn = () => {
        const payload = {
          el: this.el,
          isOpened: !!this.el.classList.contains("open")
        };
        this.fireEvent("toggleClicked", payload);
        dispatch("toggleClicked.hs.overlay", this.el, payload);
      };
      if (this.el.classList.contains("opened")) this.close(false, payloadFn);
      else this.open(payloadFn);
    }
    elementMinifierClick() {
      const payloadFn = () => {
        const payload = {
          el: this.el,
          isMinified: !!this.el.classList.contains("minified")
        };
        this.fireEvent("toggleMinifierClicked", payload);
        dispatch("toggleMinifierClicked.hs.overlay", this.el, payload);
      };
      if (this.el.classList.contains("minified")) this.minify(false, payloadFn);
      else this.minify(true, payloadFn);
    }
    minify(isMinified, cb = null) {
      if (isMinified) {
        this.el.classList.add("minified");
        document.body.classList.add("hs-overlay-minified");
        if (cb) cb();
      } else {
        this.el.classList.remove("minified");
        document.body.classList.remove("hs-overlay-minified");
        if (cb) cb();
      }
    }
    overlayClick(evt) {
      if (evt.target.id && `#${evt.target.id}` === this.el.id && this.isCloseWhenClickInside && this.hasAbilityToCloseOnBackdropClick) {
        this.close();
      }
    }
    backdropClick() {
      this.close();
    }
    init() {
      this.createCollection(window.$hsOverlayCollection, this);
      if (this.isLayoutAffect && this.openedBreakpoint) {
        const instance = _HSOverlay.getInstance(this.el, true);
        _HSOverlay.setOpened(
          this.openedBreakpoint,
          instance
        );
      }
      this.onOverlayClickListener = (evt) => this.overlayClick(evt);
      this.el.addEventListener("click", this.onOverlayClickListener);
      if (this.toggleButtons.length) this.buildToggleButtons(this.toggleButtons);
      if (this.toggleMinifierButtons.length) this.buildToggleMinifierButtons();
      if (typeof window !== "undefined") {
        if (!window.HSAccessibilityObserver) {
          window.HSAccessibilityObserver = new accessibility_manager_default();
        }
        this.setupAccessibility();
      }
    }
    buildToggleButtons(buttons) {
      buttons.forEach((el) => {
        if (this.el.classList.contains("opened")) el.ariaExpanded = "true";
        else el.ariaExpanded = "false";
        this.onElementClickListener.push({
          el,
          fn: () => this.elementClick()
        });
        el.addEventListener(
          "click",
          this.onElementClickListener.find(
            (toggleButton) => toggleButton.el === el
          ).fn
        );
      });
    }
    buildToggleMinifierButtons() {
      this.toggleMinifierButtons.forEach((el) => {
        if (this.el.classList.contains("minified")) el.ariaExpanded = "true";
        else el.ariaExpanded = "false";
        this.onElementMinifierClickListener.push({
          el,
          fn: () => this.elementMinifierClick()
        });
        el.addEventListener(
          "click",
          this.onElementMinifierClickListener.find(
            (minifierButton) => minifierButton.el === el
          ).fn
        );
      });
    }
    hideAuto() {
      const time = parseInt(getClassProperty(this.el, "--auto-hide", "0"));
      if (time) {
        this.autoHide = setTimeout(() => {
          this.close();
        }, time);
      }
    }
    checkTimer() {
      if (this.autoHide) {
        clearTimeout(this.autoHide);
        this.autoHide = null;
      }
    }
    buildBackdrop() {
      const overlayClasses = this.el.classList.value.split(" ");
      const overlayZIndex = parseInt(
        window.getComputedStyle(this.el).getPropertyValue("z-index")
      );
      const backdropId = this.el.getAttribute("data-hs-overlay-backdrop-container") || false;
      this.backdrop = document.createElement("div");
      let backdropClasses = `${this.backdropClasses} ${this.backdropExtraClasses}`;
      const closeOnBackdrop = getClassProperty(this.el, "--overlay-backdrop", "true") !== "static";
      const disableBackdrop = getClassProperty(this.el, "--overlay-backdrop", "true") === "false";
      this.backdrop.id = `${this.el.id}-backdrop`;
      if ("style" in this.backdrop) {
        this.backdrop.style.zIndex = `${overlayZIndex - 1}`;
      }
      for (const value of overlayClasses) {
        if (value.startsWith("hs-overlay-backdrop-open:") || value.includes(":hs-overlay-backdrop-open:")) {
          backdropClasses += ` ${value}`;
        }
      }
      if (disableBackdrop) return;
      if (backdropId) {
        this.backdrop = document.querySelector(backdropId).cloneNode(true);
        this.backdrop.classList.remove("hidden");
        backdropClasses = `${this.backdrop.classList.toString()}`;
        this.backdrop.classList.value = "";
      }
      if (closeOnBackdrop) {
        this.onBackdropClickListener = () => this.backdropClick();
        this.backdrop.addEventListener(
          "click",
          this.onBackdropClickListener,
          true
        );
      }
      this.backdrop.setAttribute("data-hs-overlay-backdrop-template", "");
      this.backdropParent.appendChild(this.backdrop);
      setTimeout(() => {
        this.backdrop.classList.value = backdropClasses;
      });
    }
    destroyBackdrop() {
      const backdrop = document.querySelector(
        `#${this.el.id}-backdrop`
      );
      if (!backdrop) return;
      if (this.openNextOverlay) {
        backdrop.style.transitionDuration = `${parseFloat(
          window.getComputedStyle(backdrop).transitionDuration.replace(/[^\d.-]/g, "")
        ) * 1.8}s`;
      }
      backdrop.classList.add("opacity-0");
      afterTransition(backdrop, () => {
        backdrop.remove();
      });
    }
    focusElement() {
      const input = this.el.querySelector("[autofocus]");
      if (!input) return false;
      else input.focus();
    }
    getScrollbarSize() {
      let div = document.createElement("div");
      div.style.overflow = "scroll";
      div.style.width = "100px";
      div.style.height = "100px";
      document.body.appendChild(div);
      let scrollbarSize = div.offsetWidth - div.clientWidth;
      document.body.removeChild(div);
      return scrollbarSize;
    }
    collectToggleParameters(buttons) {
      let toggleData = {};
      buttons.forEach((el) => {
        const data = el.getAttribute("data-hs-overlay-options");
        const dataOptions = data ? JSON.parse(data) : {};
        toggleData = {
          ...toggleData,
          ...dataOptions
        };
      });
      return toggleData;
    }
    isElementVisible() {
      const style = window.getComputedStyle(this.el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
      }
      const rect = this.el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return false;
      }
      let parent = this.el.parentElement;
      while (parent) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === "none" || parentStyle.visibility === "hidden" || parentStyle.opacity === "0") {
          return false;
        }
        parent = parent.parentElement;
      }
      return true;
    }
    isOpened() {
      return this.el.classList.contains("open") && !this.el.classList.contains(this.hiddenClass);
    }
    // Public methods
    open(cb = null) {
      if (this.el.classList.contains("minified")) {
        this.minify(false);
      }
      if (this.hasDynamicZIndex) {
        if (_HSOverlay.currentZIndex < this.initialZIndex) {
          _HSOverlay.currentZIndex = this.initialZIndex;
        }
        _HSOverlay.currentZIndex++;
        this.el.style.zIndex = `${_HSOverlay.currentZIndex}`;
      }
      const openedOverlays = document.querySelectorAll(".hs-overlay.open");
      const currentlyOpened = window.$hsOverlayCollection.find(
        (el) => Array.from(openedOverlays).includes(el.element.el) && !el.element.isLayoutAffect
      );
      const toggles = document.querySelectorAll(
        `[data-hs-overlay="#${this.el.id}"]`
      );
      const disabledScroll = getClassProperty(this.el, "--body-scroll", "false") !== "true";
      this.lastFocusedToggle = document.activeElement;
      if (this.isClosePrev && currentlyOpened) {
        this.openNextOverlay = true;
        return currentlyOpened.element.close().then(() => {
          this.open();
          this.openNextOverlay = false;
        });
      }
      if (disabledScroll) {
        document.body.style.overflow = "hidden";
        if (this.emulateScrollbarSpace) {
          document.body.style.paddingRight = `${this.getScrollbarSize()}px`;
        }
      }
      this.buildBackdrop();
      this.checkTimer();
      this.hideAuto();
      toggles.forEach((toggle) => {
        if (toggle.ariaExpanded) toggle.ariaExpanded = "true";
      });
      this.el.classList.remove(this.hiddenClass);
      this.el.setAttribute("aria-overlay", "true");
      this.el.setAttribute("tabindex", "-1");
      setTimeout(() => {
        if (this.el.classList.contains("opened")) return false;
        this.el.classList.add("open", "opened");
        if (this.isLayoutAffect) {
          document.body.classList.add("hs-overlay-body-open");
        }
        if (!this.initiallyOpened) {
          this.el.focus();
          this.el.style.outline = "none";
        }
        this.initiallyOpened = false;
        this.fireEvent("open", this.el);
        dispatch("open.hs.overlay", this.el, this.el);
        if (window.HSAccessibilityObserver && this.accessibilityComponent) {
          window.HSAccessibilityObserver.updateComponentState(
            this.accessibilityComponent,
            true
          );
        }
        if (this.hasAutofocus) this.focusElement();
        if (typeof cb === "function") cb();
        if (this.isElementVisible()) _HSOverlay.openedItemsQty++;
      }, 50);
    }
    close(forceClose = false, cb = null) {
      if (this.isElementVisible()) {
        _HSOverlay.openedItemsQty = _HSOverlay.openedItemsQty <= 0 ? 0 : _HSOverlay.openedItemsQty - 1;
      }
      if (_HSOverlay.openedItemsQty === 0 && this.isLayoutAffect) {
        document.body.classList.remove("hs-overlay-body-open");
      }
      const closeFn = (_cb) => {
        if (this.el.classList.contains("open")) return false;
        const toggles = document.querySelectorAll(
          `[data-hs-overlay="#${this.el.id}"]`
        );
        toggles.forEach((toggle) => {
          if (toggle.ariaExpanded) toggle.ariaExpanded = "false";
        });
        this.el.classList.add(this.hiddenClass);
        if (this.hasDynamicZIndex) this.el.style.zIndex = "";
        this.destroyBackdrop();
        this.fireEvent("close", this.el);
        dispatch("close.hs.overlay", this.el, this.el);
        if (window.HSAccessibilityObserver && this.accessibilityComponent) {
          window.HSAccessibilityObserver.updateComponentState(
            this.accessibilityComponent,
            false
          );
        }
        if (!document.querySelector(".hs-overlay.opened")) {
          document.body.style.overflow = "";
          if (this.emulateScrollbarSpace) document.body.style.paddingRight = "";
        }
        if (this.lastFocusedToggle) {
          this.lastFocusedToggle.focus();
          this.lastFocusedToggle = null;
        }
        _cb(this.el);
        if (typeof cb === "function") cb();
        if (_HSOverlay.openedItemsQty === 0) {
          document.body.classList.remove("hs-overlay-body-open");
          if (this.hasDynamicZIndex) _HSOverlay.currentZIndex = 0;
        }
      };
      return new Promise((resolve) => {
        this.el.classList.remove("open", "opened");
        this.el.removeAttribute("aria-overlay");
        this.el.removeAttribute("tabindex");
        this.el.style.outline = "";
        if (forceClose) closeFn(resolve);
        else afterTransition(this.animationTarget, () => closeFn(resolve));
      });
    }
    updateToggles() {
      const found = Array.from(
        document.querySelectorAll(
          `[data-hs-overlay="#${this.el.id}"]`
        )
      );
      const newButtons = found.filter((btn) => !this.toggleButtons.includes(btn));
      if (newButtons.length) {
        this.toggleButtons.push(...newButtons);
        this.buildToggleButtons(newButtons);
      }
      this.toggleButtons = this.toggleButtons.filter((btn) => {
        if (document.contains(btn)) return true;
        const listener = this.onElementClickListener?.find(
          (lst) => lst.el === btn
        );
        if (listener) btn.removeEventListener("click", listener.fn);
        return false;
      });
    }
    destroy() {
      this.el.classList.remove("open", "opened", this.hiddenClass);
      if (this.isLayoutAffect) {
        document.body.classList.remove("hs-overlay-body-open");
      }
      this.el.removeEventListener("click", this.onOverlayClickListener);
      if (this.onElementClickListener.length) {
        this.onElementClickListener.forEach(({ el, fn }) => {
          el.removeEventListener("click", fn);
        });
        this.onElementClickListener = null;
      }
      if (this.backdrop) {
        this.backdrop.removeEventListener("click", this.onBackdropClickListener);
      }
      if (this.backdrop) {
        this.backdrop.remove();
        this.backdrop = null;
      }
      window.$hsOverlayCollection = window.$hsOverlayCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static findInCollection(target) {
      return window.$hsOverlayCollection.find((el) => {
        if (target instanceof _HSOverlay) return el.element.el === target.el;
        else if (typeof target === "string") {
          return el.element.el === document.querySelector(target);
        } else return el.element.el === target;
      }) || null;
    }
    static getInstance(target, isInstance) {
      const _temp = typeof target === "string" ? document.querySelector(target) : target;
      const _target = _temp?.getAttribute("data-hs-overlay") ? _temp.getAttribute("data-hs-overlay") : target;
      const elInCollection = window.$hsOverlayCollection.find(
        (el) => el.element.el === (typeof _target === "string" ? document.querySelector(_target) : _target) || el.element.el === (typeof _target === "string" ? document.querySelector(_target) : _target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsOverlayCollection) {
        window.$hsOverlayCollection = [];
      }
      if (window.$hsOverlayCollection) {
        window.$hsOverlayCollection = window.$hsOverlayCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll(".hs-overlay:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsOverlayCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          new _HSOverlay(el);
        }
      });
    }
    static open(target) {
      const instance = _HSOverlay.findInCollection(target);
      if (instance && instance.element.el.classList.contains(instance.element.hiddenClass)) instance.element.open();
    }
    static close(target) {
      const instance = _HSOverlay.findInCollection(target);
      if (instance && !instance.element.el.classList.contains(instance.element.hiddenClass)) instance.element.close();
    }
    static minify(target, isMinified) {
      const instance = _HSOverlay.findInCollection(target);
      if (instance) {
        instance.element.minify(isMinified);
      }
    }
    static setOpened(breakpoint, el) {
      if (document.body.clientWidth >= breakpoint) {
        if (el.element.el.classList.contains("minified")) {
          el.element.minify(false);
        }
        document.body.classList.add("hs-overlay-body-open");
        el.element.open();
      } else el.element.close(true);
    }
    // Accessibility methods
    setupAccessibility() {
      this.accessibilityComponent = window.HSAccessibilityObserver.registerComponent(
        this.el,
        {
          onEnter: () => {
            if (!this.isOpened()) this.open();
          },
          onEsc: () => {
            if (this.isOpened()) {
              this.close();
            }
          },
          onTab: () => {
            if (!this.isOpened() || !this.isTabAccessibilityLimited) return;
            const focusableElements = Array.from(
              this.el.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              )
            ).filter(
              (el) => !el.hidden && window.getComputedStyle(el).display !== "none"
            );
            if (focusableElements.length === 0) return;
            const focusedElement = this.el.querySelector(":focus");
            const currentIndex = focusedElement ? focusableElements.indexOf(focusedElement) : -1;
            const isShiftPressed = window.event instanceof KeyboardEvent && window.event.shiftKey;
            if (isShiftPressed) {
              if (currentIndex <= 0) {
                focusableElements[focusableElements.length - 1].focus();
              } else {
                focusableElements[currentIndex - 1].focus();
              }
            } else {
              if (currentIndex === focusableElements.length - 1) {
                focusableElements[0].focus();
              } else {
                focusableElements[currentIndex + 1].focus();
              }
            }
            window.event?.preventDefault();
          }
        },
        this.isOpened(),
        "Overlay",
        ".hs-overlay"
      );
      this.toggleButtons.forEach((toggleButton) => {
        window.HSAccessibilityObserver.registerComponent(
          toggleButton,
          {
            onEnter: () => {
              if (!this.isOpened()) this.open();
            },
            onEsc: () => {
              if (this.isOpened()) {
                this.close();
              }
            }
          },
          this.isOpened(),
          "Overlay Toggle",
          `[data-hs-overlay="#${this.el.id}"]`
        );
      });
    }
    // Backward compatibility
    static on(evt, target, cb) {
      const instance = _HSOverlay.findInCollection(target);
      if (instance) instance.element.events[evt] = cb;
    }
  };
  var resizeTimeout = null;
  var debounceResize = (callback, delay = 150) => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(callback, delay);
  };
  var autoCloseResizeFn = () => {
    if (!window.$hsOverlayCollection.length || !window.$hsOverlayCollection.find((el) => el.element.autoClose)) {
      return false;
    }
    const overlays = window.$hsOverlayCollection.filter(
      (el) => el.element.autoClose
    );
    overlays.forEach((overlay) => {
      const { autoCloseEqualityType, autoClose } = overlay.element;
      const condition = autoCloseEqualityType === "less-than" ? document.body.clientWidth <= autoClose : document.body.clientWidth >= autoClose;
      if (condition && overlay.element.el.classList.contains("opened")) {
        if (overlay.element.el.classList.contains("minified")) {
          overlay.element.minify(false);
        }
        overlay.element.close(true);
      } else {
        if (overlay.element.isLayoutAffect && overlay.element.el.classList.contains("opened")) {
          document.body.classList.add("hs-overlay-body-open");
        }
      }
    });
  };
  var moveOverlayToBodyResizeFn = () => {
    if (!window.$hsOverlayCollection.length || !window.$hsOverlayCollection.find((el) => el.element.moveOverlayToBody)) {
      return false;
    }
    const overlays = window.$hsOverlayCollection.filter(
      (el) => el.element.moveOverlayToBody
    );
    overlays.forEach((overlay) => {
      const resolution = overlay.element.moveOverlayToBody;
      const initPlace = overlay.element.initContainer;
      const newPlace = document.querySelector("body");
      const target = overlay.element.el;
      if (!initPlace && target) return false;
      if (document.body.clientWidth <= resolution && !isDirectChild(newPlace, target)) {
        newPlace.appendChild(target);
      } else if (document.body.clientWidth > resolution && !initPlace.contains(target)) {
        initPlace.appendChild(target);
      }
    });
  };
  var setOpenedResizeFn = () => {
    if (!window.$hsOverlayCollection.length || !window.$hsOverlayCollection.find((el) => el.element.openedBreakpoint)) {
      return false;
    }
    const overlays = window.$hsOverlayCollection.filter(
      (el) => el.element.openedBreakpoint
    );
    overlays.forEach((overlay) => {
      const { openedBreakpoint } = overlay.element;
      const condition = document.body.clientWidth >= openedBreakpoint;
      if (condition) {
        if (!overlay.element.el.classList.contains("opened")) {
          HSOverlay.setOpened(openedBreakpoint, overlay);
        }
      } else {
        if (overlay.element.el.classList.contains("opened")) {
          if (overlay.element.el.classList.contains("minified")) {
            overlay.element.minify(false);
          }
          overlay.element.close(true);
        }
      }
    });
  };
  var setBackdropZIndexResizeFn = () => {
    if (!window.$hsOverlayCollection.length || !window.$hsOverlayCollection.find(
      (el) => el.element.el.classList.contains("opened")
    )) {
      return false;
    }
    const overlays = window.$hsOverlayCollection.filter(
      (el) => el.element.el.classList.contains("opened")
    );
    overlays.forEach((overlay) => {
      const overlayZIndex = parseInt(
        window.getComputedStyle(overlay.element.el).getPropertyValue("z-index")
      );
      const backdrop = document.querySelector(
        `#${overlay.element.el.id}-backdrop`
      );
      if (!backdrop) return false;
      const backdropZIndex = parseInt(
        window.getComputedStyle(backdrop).getPropertyValue("z-index")
      );
      if (overlayZIndex === backdropZIndex + 1) return false;
      if ("style" in backdrop) backdrop.style.zIndex = `${overlayZIndex - 1}`;
      document.body.classList.add("hs-overlay-body-open");
    });
  };
  var ensureBodyOpenForMinifiedSidebar = () => {
    if (!window.$hsOverlayCollection?.length) return;
    window.$hsOverlayCollection.forEach((overlayItem) => {
      const overlay = overlayItem.element;
      if (overlay.toggleMinifierButtons?.length > 0 && overlay.openedBreakpoint) {
        if (document.body.clientWidth >= overlay.openedBreakpoint) {
          document.body.classList.add("hs-overlay-body-open");
        } else {
          document.body.classList.remove("hs-overlay-body-open");
        }
      }
    });
  };
  window.addEventListener("load", () => {
    HSOverlay.autoInit();
    moveOverlayToBodyResizeFn();
    ensureBodyOpenForMinifiedSidebar();
  });
  window.addEventListener("resize", () => {
    debounceResize(() => {
      autoCloseResizeFn();
      setOpenedResizeFn();
    });
    moveOverlayToBodyResizeFn();
    setBackdropZIndexResizeFn();
    ensureBodyOpenForMinifiedSidebar();
  });
  if (typeof window !== "undefined") {
    window.HSOverlay = HSOverlay;
  }
  var overlay_default = HSOverlay;

  // node_modules/preline/src/plugins/pin-input/index.ts
  init_utils();
  init_base_plugin();
  var HSPinInput = class _HSPinInput extends HSBasePlugin {
    items;
    currentItem;
    currentValue;
    placeholders;
    availableCharsRE;
    onElementInputListener;
    onElementPasteListener;
    onElementKeydownListener;
    onElementFocusinListener;
    onElementFocusoutListener;
    elementInput(evt, index) {
      this.onInput(evt, index);
    }
    elementPaste(evt) {
      this.onPaste(evt);
    }
    elementKeydown(evt, index) {
      this.onKeydown(evt, index);
    }
    elementFocusin(index) {
      this.onFocusIn(index);
    }
    elementFocusout(index) {
      this.onFocusOut(index);
    }
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-pin-input");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.items = this.el.querySelectorAll("[data-hs-pin-input-item]");
      this.currentItem = null;
      this.currentValue = new Array(this.items.length).fill("");
      this.placeholders = [];
      this.availableCharsRE = new RegExp(
        concatOptions?.availableCharsRE || "^[a-zA-Z0-9]+$"
      );
      this.onElementInputListener = [];
      this.onElementPasteListener = [];
      this.onElementKeydownListener = [];
      this.onElementFocusinListener = [];
      this.onElementFocusoutListener = [];
      this.init();
    }
    init() {
      this.createCollection(window.$hsPinInputCollection, this);
      if (this.items.length) this.build();
    }
    build() {
      this.buildInputItems();
    }
    buildInputItems() {
      this.items.forEach((el, index) => {
        this.placeholders.push(el.getAttribute("placeholder") || "");
        if (el.hasAttribute("autofocus")) this.onFocusIn(index);
        this.onElementInputListener.push({
          el,
          fn: (evt) => this.elementInput(evt, index)
        });
        this.onElementPasteListener.push({
          el,
          fn: (evt) => this.elementPaste(evt)
        });
        this.onElementKeydownListener.push({
          el,
          fn: (evt) => this.elementKeydown(evt, index)
        });
        this.onElementFocusinListener.push({
          el,
          fn: () => this.elementFocusin(index)
        });
        this.onElementFocusoutListener.push({
          el,
          fn: () => this.elementFocusout(index)
        });
        el.addEventListener(
          "input",
          this.onElementInputListener.find((elI) => elI.el === el).fn
        );
        el.addEventListener(
          "paste",
          this.onElementPasteListener.find((elI) => elI.el === el).fn
        );
        el.addEventListener(
          "keydown",
          this.onElementKeydownListener.find((elI) => elI.el === el).fn
        );
        el.addEventListener(
          "focusin",
          this.onElementFocusinListener.find((elI) => elI.el === el).fn
        );
        el.addEventListener(
          "focusout",
          this.onElementFocusoutListener.find((elI) => elI.el === el).fn
        );
      });
    }
    checkIfNumber(value) {
      return value.match(this.availableCharsRE);
    }
    autoFillAll(text) {
      Array.from(text).forEach((n, i) => {
        if (!this?.items[i]) return false;
        this.items[i].value = n;
        this.items[i].dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    setCurrentValue() {
      this.currentValue = Array.from(this.items).map(
        (el) => el.value
      );
    }
    toggleCompleted() {
      if (!this.currentValue.includes("")) this.el.classList.add("active");
      else this.el.classList.remove("active");
    }
    onInput(evt, index) {
      const originalValue = evt.target.value;
      this.currentItem = evt.target;
      this.currentItem.value = "";
      this.currentItem.value = originalValue[originalValue.length - 1];
      if (!this.checkIfNumber(this.currentItem.value)) {
        this.currentItem.value = this.currentValue[index] || "";
        return false;
      }
      this.setCurrentValue();
      if (this.currentItem.value) {
        if (index < this.items.length - 1) this.items[index + 1].focus();
        if (!this.currentValue.includes("")) {
          const payload = { currentValue: this.currentValue };
          this.fireEvent("completed", payload);
          dispatch("completed.hs.pinInput", this.el, payload);
        }
        this.toggleCompleted();
      } else {
        if (index > 0) this.items[index - 1].focus();
      }
    }
    onKeydown(evt, index) {
      if (evt.key === "Backspace" && index > 0) {
        if (this.items[index].value === "") {
          this.items[index - 1].value = "";
          this.items[index - 1].focus();
        } else {
          this.items[index].value = "";
        }
      }
      this.setCurrentValue();
      this.toggleCompleted();
    }
    onFocusIn(index) {
      this.items[index].setAttribute("placeholder", "");
    }
    onFocusOut(index) {
      this.items[index].setAttribute("placeholder", this.placeholders[index]);
    }
    onPaste(evt) {
      evt.preventDefault();
      this.items.forEach((el) => {
        if (document.activeElement === el)
          this.autoFillAll(evt.clipboardData.getData("text"));
      });
    }
    // Public methods
    destroy() {
      this.el.classList.remove("active");
      if (this.items.length)
        this.items.forEach((el) => {
          el.removeEventListener(
            "input",
            this.onElementInputListener.find((elI) => elI.el === el).fn
          );
          el.removeEventListener(
            "paste",
            this.onElementPasteListener.find((elI) => elI.el === el).fn
          );
          el.removeEventListener(
            "keydown",
            this.onElementKeydownListener.find((elI) => elI.el === el).fn
          );
          el.removeEventListener(
            "focusin",
            this.onElementFocusinListener.find((elI) => elI.el === el).fn
          );
          el.removeEventListener(
            "focusout",
            this.onElementFocusoutListener.find((elI) => elI.el === el).fn
          );
        });
      this.items = null;
      this.currentItem = null;
      this.currentValue = null;
      window.$hsPinInputCollection = window.$hsPinInputCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static method
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsPinInputCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsPinInputCollection) window.$hsPinInputCollection = [];
      if (window.$hsPinInputCollection)
        window.$hsPinInputCollection = window.$hsPinInputCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll("[data-hs-pin-input]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsPinInputCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSPinInput(el);
      });
    }
  };
  window.addEventListener("load", () => {
    HSPinInput.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSPinInput = HSPinInput;
  }
  var pin_input_default = HSPinInput;

  // node_modules/preline/src/plugins/remove-element/index.ts
  init_utils();
  init_base_plugin();
  var HSRemoveElement = class _HSRemoveElement extends HSBasePlugin {
    removeTargetId;
    removeTarget;
    removeTargetAnimationClass;
    onElementClickListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-remove-element-options");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.removeTargetId = this.el.getAttribute("data-hs-remove-element");
      this.removeTarget = document.querySelector(this.removeTargetId);
      this.removeTargetAnimationClass = concatOptions?.removeTargetAnimationClass || "hs-removing";
      if (this.removeTarget) this.init();
    }
    elementClick() {
      this.remove();
    }
    init() {
      this.createCollection(window.$hsRemoveElementCollection, this);
      this.onElementClickListener = () => this.elementClick();
      this.el.addEventListener("click", this.onElementClickListener);
    }
    remove() {
      if (!this.removeTarget) return false;
      this.removeTarget.classList.add(this.removeTargetAnimationClass);
      afterTransition(
        this.removeTarget,
        () => setTimeout(() => this.removeTarget.remove())
      );
    }
    // Public methods
    destroy() {
      this.removeTarget.classList.remove(this.removeTargetAnimationClass);
      this.el.removeEventListener("click", this.onElementClickListener);
      window.$hsRemoveElementCollection = window.$hsRemoveElementCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static method
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsRemoveElementCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target) || el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsRemoveElementCollection)
        window.$hsRemoveElementCollection = [];
      if (window.$hsRemoveElementCollection)
        window.$hsRemoveElementCollection = window.$hsRemoveElementCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll("[data-hs-remove-element]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsRemoveElementCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSRemoveElement(el);
      });
    }
  };
  window.addEventListener("load", () => {
    HSRemoveElement.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSRemoveElement = HSRemoveElement;
  }
  var remove_element_default = HSRemoveElement;

  // node_modules/preline/src/plugins/scroll-nav/index.ts
  init_utils();
  init_base_plugin();
  var HSScrollNav = class _HSScrollNav extends HSBasePlugin {
    paging;
    autoCentering;
    body;
    items;
    prev;
    next;
    currentState;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-scroll-nav");
      const dataOptions = data ? JSON.parse(data) : {};
      const defaultOptions = {
        paging: true,
        autoCentering: false
      };
      const concatOptions = {
        ...defaultOptions,
        ...dataOptions,
        ...options
      };
      this.paging = concatOptions.paging ?? true;
      this.autoCentering = concatOptions.autoCentering ?? false;
      this.body = this.el.querySelector(".hs-scroll-nav-body");
      this.items = this.body ? Array.from(this.body.querySelectorAll(":scope > *")) : [];
      this.prev = this.el.querySelector(".hs-scroll-nav-prev") || null;
      this.next = this.el.querySelector(".hs-scroll-nav-next") || null;
      this.setCurrentState();
      this.init();
    }
    init() {
      if (!this.body || !this.items.length) return false;
      this.createCollection(window.$hsScrollNavCollection, this);
      this.setCurrentState();
      if (this.paging) {
        if (this.prev) this.buildPrev();
        if (this.next) this.buildNext();
      } else {
        if (this.prev) this.buildPrevSingle();
        if (this.next) this.buildNextSingle();
      }
      if (this.autoCentering) this.scrollToActiveElement();
      this.body.addEventListener("scroll", debounce(() => this.setCurrentState(), 200));
      window.addEventListener("resize", debounce(() => {
        this.setCurrentState();
        if (this.autoCentering) this.scrollToActiveElement();
      }, 200));
    }
    setCurrentState() {
      this.currentState = {
        first: this.getFirstVisibleItem(),
        last: this.getLastVisibleItem(),
        center: this.getCenterVisibleItem()
      };
      if (this.prev) this.setPrevToDisabled();
      if (this.next) this.setNextToDisabled();
    }
    setPrevToDisabled() {
      if (this.currentState.first === this.items[0]) {
        this.prev.setAttribute("disabled", "disabled");
        this.prev.classList.add("disabled");
      } else {
        this.prev.removeAttribute("disabled");
        this.prev.classList.remove("disabled");
      }
    }
    setNextToDisabled() {
      if (this.currentState.last === this.items[this.items.length - 1]) {
        this.next.setAttribute("disabled", "disabled");
        this.next.classList.add("disabled");
      } else {
        this.next.removeAttribute("disabled");
        this.next.classList.remove("disabled");
      }
    }
    buildPrev() {
      if (!this.prev) return;
      this.prev.addEventListener("click", () => {
        const firstVisible = this.currentState.first;
        if (!firstVisible) return;
        const visibleCount = this.getVisibleItemsCount();
        let target = firstVisible;
        for (let i = 0; i < visibleCount; i++) {
          if (target.previousElementSibling) {
            target = target.previousElementSibling;
          } else {
            break;
          }
        }
        this.goTo(target);
      });
    }
    buildNext() {
      if (!this.next) return;
      this.next.addEventListener("click", () => {
        const lastVisible = this.currentState.last;
        if (!lastVisible) return;
        const visibleCount = this.getVisibleItemsCount();
        let target = lastVisible;
        for (let i = 0; i < visibleCount; i++) {
          if (target.nextElementSibling) {
            target = target.nextElementSibling;
          } else {
            break;
          }
        }
        this.goTo(target);
      });
    }
    buildPrevSingle() {
      this.prev?.addEventListener("click", () => {
        const firstVisible = this.currentState.first;
        if (!firstVisible) return;
        const prev = firstVisible.previousElementSibling;
        if (prev) this.goTo(prev);
      });
    }
    buildNextSingle() {
      this.next?.addEventListener("click", () => {
        const lastVisible = this.currentState.last;
        if (!lastVisible) return;
        const next = lastVisible.nextElementSibling;
        if (next) this.goTo(next);
      });
    }
    getCenterVisibleItem() {
      const containerCenter = this.body.scrollLeft + this.body.clientWidth / 2;
      let closestItem = null;
      let minDistance = Infinity;
      this.items.forEach((item) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestItem = item;
        }
      });
      return closestItem;
    }
    getFirstVisibleItem() {
      const containerRect = this.body.getBoundingClientRect();
      for (let item of this.items) {
        const itemRect = item.getBoundingClientRect();
        const isFullyVisible = itemRect.left >= containerRect.left && itemRect.right <= containerRect.right;
        if (isFullyVisible) {
          return item;
        }
      }
      return null;
    }
    getLastVisibleItem() {
      const containerRect = this.body.getBoundingClientRect();
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        const itemRect = item.getBoundingClientRect();
        const isPartiallyVisible = itemRect.left < containerRect.right && itemRect.right > containerRect.left;
        if (isPartiallyVisible) {
          return item;
        }
      }
      return null;
    }
    getVisibleItemsCount() {
      const containerWidth = this.body.clientWidth;
      let count = 0;
      let totalWidth = 0;
      for (let item of this.items) {
        totalWidth += item.offsetWidth;
        if (totalWidth <= containerWidth) {
          count++;
        } else {
          break;
        }
      }
      return count;
    }
    scrollToActiveElement() {
      const active = this.body.querySelector(".active");
      if (!active) return false;
      this.centerElement(active);
    }
    // Public methods
    getCurrentState() {
      return this.currentState;
    }
    goTo(el, cb) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
      const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.target === el && entry.isIntersecting) {
            if (typeof cb === "function") cb();
            observerInstance.disconnect();
          }
        });
      }, {
        root: this.body,
        threshold: 1
      });
      observer.observe(el);
    }
    centerElement(el, behavior = "smooth") {
      if (!this.body.contains(el)) {
        return;
      }
      const elementCenter = el.offsetLeft + el.offsetWidth / 2;
      const scrollTo = elementCenter - this.body.clientWidth / 2;
      this.body.scrollTo({
        left: scrollTo,
        behavior
      });
    }
    destroy() {
      if (this.paging) {
        if (this.prev) this.prev.removeEventListener("click", this.buildPrev);
        if (this.next) this.next.removeEventListener("click", this.buildNext);
      } else {
        if (this.prev) this.prev.removeEventListener("click", this.buildPrevSingle);
        if (this.next) this.next.removeEventListener("click", this.buildNextSingle);
      }
      window.removeEventListener("resize", debounce(() => this.setCurrentState(), 200));
      window.$hsScrollNavCollection = window.$hsScrollNavCollection.filter(({ element }) => element.el !== this.el);
    }
    // Static method
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsScrollNavCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target) || el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsScrollNavCollection) window.$hsScrollNavCollection = [];
      if (window.$hsScrollNavCollection) window.$hsRemoveElementCollection = window.$hsRemoveElementCollection.filter(({ element }) => document.contains(element.el));
      document.querySelectorAll("[data-hs-scroll-nav]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsScrollNavCollection.find((elC) => elC?.element?.el === el)) new _HSScrollNav(el);
      });
    }
  };
  window.addEventListener("load", () => {
    HSScrollNav.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSScrollNav = HSScrollNav;
  }
  var scroll_nav_default = HSScrollNav;

  // node_modules/preline/src/plugins/scrollspy/index.ts
  init_utils();
  init_base_plugin();
  var HSScrollspy = class _HSScrollspy extends HSBasePlugin {
    ignoreScrollUp;
    links;
    sections;
    scrollableId;
    scrollable;
    isScrollingDown = false;
    lastScrollTop = 0;
    onScrollableScrollListener;
    onLinkClickListener;
    constructor(el, options = {}) {
      super(el, options);
      const data = el.getAttribute("data-hs-scrollspy-options");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.ignoreScrollUp = typeof concatOptions.ignoreScrollUp !== "undefined" ? concatOptions.ignoreScrollUp : false;
      this.links = this.el.querySelectorAll("[href]");
      this.sections = [];
      this.scrollableId = this.el.getAttribute("data-hs-scrollspy-scrollable-parent");
      this.scrollable = this.scrollableId ? document.querySelector(this.scrollableId) : document;
      this.onLinkClickListener = [];
      this.init();
    }
    scrollableScroll(evt) {
      const currentScrollTop = this.scrollable instanceof HTMLElement ? this.scrollable.scrollTop : window.scrollY;
      this.isScrollingDown = currentScrollTop > this.lastScrollTop;
      this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
      Array.from(this.sections).forEach((section) => {
        if (!section.getAttribute("id")) return false;
        this.update(evt, section);
      });
    }
    init() {
      this.createCollection(window.$hsScrollspyCollection, this);
      this.links.forEach((el) => {
        this.sections.push(this.scrollable.querySelector(el.getAttribute("href")));
      });
      this.onScrollableScrollListener = (evt) => this.scrollableScroll(evt);
      this.scrollable.addEventListener("scroll", this.onScrollableScrollListener);
      this.links.forEach((el) => {
        this.onLinkClickListener.push({
          el,
          fn: (evt) => this.linkClick(evt, el)
        });
        el.addEventListener(
          "click",
          this.onLinkClickListener.find((link) => link.el === el).fn
        );
      });
    }
    determineScrollDirection(target) {
      const activeLink = this.el.querySelector("a.active");
      if (!activeLink) {
        return true;
      }
      const activeIndex = Array.from(this.links).indexOf(activeLink);
      const targetIndex = Array.from(this.links).indexOf(target);
      if (targetIndex === -1) {
        return true;
      }
      return targetIndex > activeIndex;
    }
    linkClick(evt, el) {
      evt.preventDefault();
      const href = el.getAttribute("href");
      if (!href || href === "javascript:;") return;
      const target = href ? document.querySelector(href) : null;
      if (!target) return;
      this.isScrollingDown = this.determineScrollDirection(el);
      this.scrollTo(el);
    }
    update(evt, section) {
      const globalOffset = parseInt(getClassProperty(this.el, "--scrollspy-offset", "0"));
      const userOffset = parseInt(getClassProperty(section, "--scrollspy-offset")) || globalOffset;
      const scrollableParentOffset = evt.target === document ? 0 : parseInt(String(evt.target.getBoundingClientRect().top));
      const topOffset = parseInt(String(section.getBoundingClientRect().top)) - userOffset - scrollableParentOffset;
      const height = section.offsetHeight;
      const statement = this.ignoreScrollUp ? topOffset <= 0 && topOffset + height > 0 : this.isScrollingDown ? topOffset <= 0 && topOffset + height > 0 : topOffset <= 0 && topOffset < height;
      if (statement) {
        this.links.forEach((el) => el.classList.remove("active"));
        const current = this.el.querySelector(`[href="#${section.getAttribute("id")}"]`);
        if (current) {
          current.classList.add("active");
          const group = current.closest("[data-hs-scrollspy-group]");
          if (group) {
            const parentLink = group.querySelector("[href]");
            if (parentLink) parentLink.classList.add("active");
          }
        }
        this.fireEvent("afterScroll", current);
        dispatch("afterScroll.hs.scrollspy", current, this.el);
      }
    }
    scrollTo(link) {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);
      const globalOffset = parseInt(getClassProperty(this.el, "--scrollspy-offset", "0"));
      const userOffset = parseInt(getClassProperty(target, "--scrollspy-offset")) || globalOffset;
      const scrollableParentOffset = this.scrollable === document ? 0 : this.scrollable.offsetTop;
      const topOffset = target.offsetTop - userOffset - scrollableParentOffset;
      const view = this.scrollable === document ? window : this.scrollable;
      const scrollFn = () => {
        window.history.replaceState(null, null, link.getAttribute("href"));
        if ("scrollTo" in view) {
          view.scrollTo({
            top: topOffset,
            left: 0,
            behavior: "smooth"
          });
        }
      };
      const beforeScroll = this.fireEvent("beforeScroll", this.el);
      dispatch("beforeScroll.hs.scrollspy", this.el, this.el);
      if (beforeScroll instanceof Promise) beforeScroll.then(() => scrollFn());
      else scrollFn();
    }
    // Public methods
    destroy() {
      const activeLink = this.el.querySelector("[href].active");
      activeLink.classList.remove("active");
      this.scrollable.removeEventListener(
        "scroll",
        this.onScrollableScrollListener
      );
      if (this.onLinkClickListener.length)
        this.onLinkClickListener.forEach(({ el, fn }) => {
          el.removeEventListener("click", fn);
        });
      window.$hsScrollspyCollection = window.$hsScrollspyCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance = false) {
      const elInCollection = window.$hsScrollspyCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsScrollspyCollection) window.$hsScrollspyCollection = [];
      if (window.$hsScrollspyCollection)
        window.$hsScrollspyCollection = window.$hsScrollspyCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll("[data-hs-scrollspy]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsScrollspyCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSScrollspy(el);
      });
    }
  };
  window.addEventListener("load", () => {
    HSScrollspy.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSScrollspy = HSScrollspy;
  }
  var scrollspy_default = HSScrollspy;

  // node_modules/preline/src/index.ts
  init_select();

  // node_modules/preline/src/plugins/stepper/index.ts
  init_utils();
  init_base_plugin();
  var HSStepper = class _HSStepper extends HSBasePlugin {
    currentIndex;
    mode;
    isCompleted;
    totalSteps;
    navItems;
    contentItems;
    backBtn;
    nextBtn;
    skipBtn;
    completeStepBtn;
    completeStepBtnDefaultText;
    finishBtn;
    resetBtn;
    onNavItemClickListener;
    onBackClickListener;
    onNextClickListener;
    onSkipClickListener;
    onCompleteStepBtnClickListener;
    onFinishBtnClickListener;
    onResetBtnClickListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-stepper");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.currentIndex = concatOptions?.currentIndex || 1;
      this.mode = concatOptions?.mode || "linear";
      this.isCompleted = typeof concatOptions?.isCompleted !== "undefined" ? concatOptions?.isCompleted : false;
      this.totalSteps = 1;
      this.navItems = [];
      this.contentItems = [];
      this.onNavItemClickListener = [];
      this.init();
    }
    navItemClick(item) {
      this.handleNavItemClick(item);
    }
    backClick() {
      this.handleBackButtonClick();
      if (this.mode === "linear") {
        const currentNavItem = this.navItems.find(
          ({ index }) => index === this.currentIndex
        );
        const currentContentItem = this.contentItems.find(
          ({ index }) => index === this.currentIndex
        );
        if (!currentNavItem || !currentContentItem) return;
        if (currentNavItem.isCompleted) {
          currentNavItem.isCompleted = false;
          currentNavItem.isSkip = false;
          currentNavItem.el.classList.remove("success", "skipped");
        }
        if (currentContentItem.isCompleted) {
          currentContentItem.isCompleted = false;
          currentContentItem.isSkip = false;
          currentContentItem.el.classList.remove("success", "skipped");
        }
        if (this.mode === "linear" && this.currentIndex !== this.totalSteps) {
          if (this.nextBtn) this.nextBtn.style.display = "";
          if (this.completeStepBtn) this.completeStepBtn.style.display = "";
        }
        this.showSkipButton();
        this.showFinishButton();
        this.showCompleteStepButton();
      }
    }
    nextClick() {
      this.fireEvent("beforeNext", this.currentIndex);
      dispatch("beforeNext.hs.stepper", this.el, this.currentIndex);
      if (this.getNavItem(this.currentIndex)?.isProcessed) {
        this.disableAll();
        return false;
      }
      this.goToNext();
    }
    skipClick() {
      this.handleSkipButtonClick();
      if (this.mode === "linear" && this.currentIndex === this.totalSteps) {
        if (this.nextBtn) this.nextBtn.style.display = "none";
        if (this.completeStepBtn) this.completeStepBtn.style.display = "none";
        if (this.finishBtn) this.finishBtn.style.display = "";
      }
    }
    completeStepBtnClick() {
      this.handleCompleteStepButtonClick();
    }
    finishBtnClick() {
      this.fireEvent("beforeFinish", this.currentIndex);
      dispatch("beforeFinish.hs.stepper", this.el, this.currentIndex);
      if (this.getNavItem(this.currentIndex)?.isProcessed) {
        this.disableAll();
        return false;
      }
      this.handleFinishButtonClick();
    }
    resetBtnClick() {
      this.handleResetButtonClick();
    }
    init() {
      this.createCollection(window.$hsStepperCollection, this);
      this.buildNav();
      this.buildContent();
      this.buildButtons();
      this.setTotalSteps();
    }
    getUncompletedSteps(inIncludedSkipped = false) {
      return this.navItems.filter(
        ({ isCompleted, isSkip }) => inIncludedSkipped ? !isCompleted || isSkip : !isCompleted && !isSkip
      );
    }
    setTotalSteps() {
      this.navItems.forEach((item) => {
        const { index } = item;
        if (index > this.totalSteps) this.totalSteps = index;
      });
    }
    // Nav
    buildNav() {
      this.el.querySelectorAll("[data-hs-stepper-nav-item]").forEach((el) => this.addNavItem(el));
      this.navItems.forEach((item) => this.buildNavItem(item));
    }
    buildNavItem(item) {
      const { index, isDisabled, el } = item;
      if (index === this.currentIndex) this.setCurrentNavItem();
      if (this.mode !== "linear" || isDisabled) {
        this.onNavItemClickListener.push({
          el,
          fn: () => this.navItemClick(item)
        });
        el.addEventListener(
          "click",
          this.onNavItemClickListener.find((navItem) => navItem.el === el).fn
        );
      }
    }
    addNavItem(el) {
      const {
        index,
        isFinal = false,
        isCompleted = false,
        isSkip = false,
        isOptional = false,
        isDisabled = false,
        isProcessed = false,
        hasError = false
      } = JSON.parse(el.getAttribute("data-hs-stepper-nav-item"));
      if (isCompleted) el.classList.add("success");
      if (isSkip) el.classList.add("skipped");
      if (isDisabled) {
        if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
          el.setAttribute("disabled", "disabled");
        }
        el.classList.add("disabled");
      }
      if (hasError) el.classList.add("error");
      this.navItems.push({
        index,
        isFinal,
        isCompleted,
        isSkip,
        isOptional,
        isDisabled,
        isProcessed,
        hasError,
        el
      });
    }
    setCurrentNavItem() {
      this.navItems.forEach((item) => {
        const { index, el } = item;
        if (index === this.currentIndex) this.setCurrentNavItemActions(el);
        else this.unsetCurrentNavItemActions(el);
      });
    }
    setCurrentNavItemActions(el) {
      el.classList.add("active");
      this.fireEvent("active", this.currentIndex);
      dispatch("active.hs.stepper", this.el, this.currentIndex);
    }
    getNavItem(n = this.currentIndex) {
      return this.navItems.find(({ index }) => index === n);
    }
    setProcessedNavItemActions(item) {
      item.isProcessed = true;
      item.el.classList.add("processed");
    }
    setErrorNavItemActions(item) {
      item.hasError = true;
      item.el.classList.add("error");
    }
    unsetCurrentNavItemActions(el) {
      el.classList.remove("active");
    }
    handleNavItemClick(item) {
      const { index } = item;
      this.currentIndex = index;
      this.setCurrentNavItem();
      this.setCurrentContentItem();
      this.checkForTheFirstStep();
    }
    // Content
    buildContent() {
      this.el.querySelectorAll("[data-hs-stepper-content-item]").forEach((el) => this.addContentItem(el));
      this.navItems.forEach((item) => this.buildContentItem(item));
    }
    buildContentItem(item) {
      const { index } = item;
      if (index === this.currentIndex) this.setCurrentContentItem();
    }
    addContentItem(el) {
      const {
        index,
        isFinal = false,
        isCompleted = false,
        isSkip = false
      } = JSON.parse(el.getAttribute("data-hs-stepper-content-item"));
      if (isCompleted) el.classList.add("success");
      if (isSkip) el.classList.add("skipped");
      this.contentItems.push({
        index,
        isFinal,
        isCompleted,
        isSkip,
        el
      });
    }
    setCurrentContentItem() {
      if (this.isCompleted) {
        const finalContentItem = this.contentItems.find(({ isFinal }) => isFinal);
        const otherContentItems = this.contentItems.filter(
          ({ isFinal }) => !isFinal
        );
        finalContentItem.el.style.display = "";
        otherContentItems.forEach(({ el }) => el.style.display = "none");
        return false;
      }
      this.contentItems.forEach((item) => {
        const { index, el } = item;
        if (index === this.currentIndex) this.setCurrentContentItemActions(el);
        else this.unsetCurrentContentItemActions(el);
      });
    }
    hideAllContentItems() {
      this.contentItems.forEach(({ el }) => el.style.display = "none");
    }
    setCurrentContentItemActions(el) {
      el.style.display = "";
    }
    unsetCurrentContentItemActions(el) {
      el.style.display = "none";
    }
    disableAll() {
      const currentNavItem = this.getNavItem(this.currentIndex);
      currentNavItem.hasError = false;
      currentNavItem.isCompleted = false;
      currentNavItem.isDisabled = false;
      currentNavItem.el.classList.remove("error", "success");
      this.disableButtons();
    }
    disableNavItemActions(item) {
      item.isDisabled = true;
      item.el.classList.add("disabled");
    }
    enableNavItemActions(item) {
      item.isDisabled = false;
      item.el.classList.remove("disabled");
    }
    // Buttons
    buildButtons() {
      this.backBtn = this.el.querySelector("[data-hs-stepper-back-btn]");
      this.nextBtn = this.el.querySelector("[data-hs-stepper-next-btn]");
      this.skipBtn = this.el.querySelector("[data-hs-stepper-skip-btn]");
      this.completeStepBtn = this.el.querySelector(
        "[data-hs-stepper-complete-step-btn]"
      );
      this.finishBtn = this.el.querySelector("[data-hs-stepper-finish-btn]");
      this.resetBtn = this.el.querySelector("[data-hs-stepper-reset-btn]");
      this.buildBackButton();
      this.buildNextButton();
      this.buildSkipButton();
      this.buildCompleteStepButton();
      this.buildFinishButton();
      this.buildResetButton();
    }
    // back
    buildBackButton() {
      if (!this.backBtn) return;
      this.checkForTheFirstStep();
      this.onBackClickListener = () => this.backClick();
      this.backBtn.addEventListener("click", this.onBackClickListener);
    }
    handleBackButtonClick() {
      if (this.currentIndex === 1) return;
      if (this.mode === "linear") {
        this.removeOptionalClasses();
      }
      this.currentIndex--;
      if (this.mode === "linear") {
        this.removeOptionalClasses();
      }
      this.setCurrentNavItem();
      this.setCurrentContentItem();
      this.checkForTheFirstStep();
      if (this.completeStepBtn) {
        this.changeTextAndDisableCompleteButtonIfStepCompleted();
      }
      this.fireEvent("back", this.currentIndex);
      dispatch("back.hs.stepper", this.el, this.currentIndex);
    }
    checkForTheFirstStep() {
      if (this.currentIndex === 1) {
        this.setToDisabled(this.backBtn);
      } else {
        this.setToNonDisabled(this.backBtn);
      }
    }
    setToDisabled(el) {
      if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
        el.setAttribute("disabled", "disabled");
      }
      el.classList.add("disabled");
    }
    setToNonDisabled(el) {
      if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
        el.removeAttribute("disabled");
      }
      el.classList.remove("disabled");
    }
    // next
    buildNextButton() {
      if (!this.nextBtn) return;
      this.onNextClickListener = () => this.nextClick();
      this.nextBtn.addEventListener("click", this.onNextClickListener);
    }
    unsetProcessedNavItemActions(item) {
      item.isProcessed = false;
      item.el.classList.remove("processed");
    }
    handleNextButtonClick(infinite = true) {
      if (infinite) {
        if (this.currentIndex === this.totalSteps) this.currentIndex = 1;
        else this.currentIndex++;
      } else {
        const nonCompletedSteps = this.getUncompletedSteps();
        if (nonCompletedSteps.length === 1) {
          const { index } = nonCompletedSteps[0];
          this.currentIndex = index;
        } else {
          if (this.currentIndex === this.totalSteps) return;
          this.currentIndex++;
        }
      }
      if (this.mode === "linear") {
        this.removeOptionalClasses();
      }
      this.setCurrentNavItem();
      this.setCurrentContentItem();
      this.checkForTheFirstStep();
      if (this.completeStepBtn) {
        this.changeTextAndDisableCompleteButtonIfStepCompleted();
      }
      this.showSkipButton();
      this.showFinishButton();
      this.showCompleteStepButton();
      this.fireEvent("next", this.currentIndex);
      dispatch("next.hs.stepper", this.el, this.currentIndex);
    }
    removeOptionalClasses() {
      const currentNavItem = this.navItems.find(
        ({ index }) => index === this.currentIndex
      );
      const currentContentItem = this.contentItems.find(
        ({ index }) => index === this.currentIndex
      );
      currentNavItem.isSkip = false;
      currentNavItem.hasError = false;
      currentNavItem.isDisabled = false;
      currentContentItem.isSkip = false;
      currentNavItem.el.classList.remove("skipped", "success", "error");
      currentContentItem.el.classList.remove("skipped", "success", "error");
    }
    // skip
    buildSkipButton() {
      if (!this.skipBtn) return;
      this.showSkipButton();
      this.onSkipClickListener = () => this.skipClick();
      this.skipBtn.addEventListener("click", this.onSkipClickListener);
    }
    setSkipItem(n) {
      const targetNavItem = this.navItems.find(
        ({ index }) => index === (n || this.currentIndex)
      );
      const targetContentItem = this.contentItems.find(
        ({ index }) => index === (n || this.currentIndex)
      );
      if (!targetNavItem || !targetContentItem) return;
      this.setSkipItemActions(targetNavItem);
      this.setSkipItemActions(targetContentItem);
    }
    setSkipItemActions(item) {
      item.isSkip = true;
      item.el.classList.add("skipped");
    }
    showSkipButton() {
      if (!this.skipBtn) return;
      const { isOptional } = this.navItems.find(
        ({ index }) => index === this.currentIndex
      );
      if (isOptional) this.skipBtn.style.display = "";
      else this.skipBtn.style.display = "none";
    }
    handleSkipButtonClick() {
      this.setSkipItem();
      this.handleNextButtonClick();
      this.fireEvent("skip", this.currentIndex);
      dispatch("skip.hs.stepper", this.el, this.currentIndex);
    }
    // complete
    buildCompleteStepButton() {
      if (!this.completeStepBtn) return;
      this.completeStepBtnDefaultText = this.completeStepBtn.innerText;
      this.onCompleteStepBtnClickListener = () => this.completeStepBtnClick();
      this.completeStepBtn.addEventListener(
        "click",
        this.onCompleteStepBtnClickListener
      );
    }
    changeTextAndDisableCompleteButtonIfStepCompleted() {
      const currentNavItem = this.navItems.find(
        ({ index }) => index === this.currentIndex
      );
      const { completedText } = JSON.parse(
        this.completeStepBtn.getAttribute("data-hs-stepper-complete-step-btn")
      );
      if (!currentNavItem) return;
      if (currentNavItem.isCompleted) {
        this.completeStepBtn.innerText = completedText || this.completeStepBtnDefaultText;
        this.completeStepBtn.setAttribute("disabled", "disabled");
        this.completeStepBtn.classList.add("disabled");
      } else {
        this.completeStepBtn.innerText = this.completeStepBtnDefaultText;
        this.completeStepBtn.removeAttribute("disabled");
        this.completeStepBtn.classList.remove("disabled");
      }
    }
    setCompleteItem(n) {
      const targetNavItem = this.navItems.find(
        ({ index }) => index === (n || this.currentIndex)
      );
      const targetContentItem = this.contentItems.find(
        ({ index }) => index === (n || this.currentIndex)
      );
      if (!targetNavItem || !targetContentItem) return;
      this.setCompleteItemActions(targetNavItem);
      this.setCompleteItemActions(targetContentItem);
    }
    setCompleteItemActions(item) {
      item.isCompleted = true;
      item.el.classList.add("success");
    }
    showCompleteStepButton() {
      if (!this.completeStepBtn) return;
      const nonCompletedSteps = this.getUncompletedSteps();
      if (nonCompletedSteps.length === 1) {
        this.completeStepBtn.style.display = "none";
      } else this.completeStepBtn.style.display = "";
    }
    handleCompleteStepButtonClick() {
      this.setCompleteItem();
      this.fireEvent("complete", this.currentIndex);
      dispatch("complete.hs.stepper", this.el, this.currentIndex);
      this.handleNextButtonClick(false);
      this.showFinishButton();
      this.showCompleteStepButton();
      this.checkForTheFirstStep();
      if (this.completeStepBtn) {
        this.changeTextAndDisableCompleteButtonIfStepCompleted();
      }
      this.showSkipButton();
    }
    // finish
    buildFinishButton() {
      if (!this.finishBtn) return;
      if (this.isCompleted) {
        this.setCompleted();
      }
      this.onFinishBtnClickListener = () => this.finishBtnClick();
      this.finishBtn.addEventListener("click", this.onFinishBtnClickListener);
    }
    setCompleted() {
      this.el.classList.add("completed");
    }
    unsetCompleted() {
      this.el.classList.remove("completed");
    }
    showFinishButton() {
      if (!this.finishBtn) return;
      const nonCompletedSteps = this.getUncompletedSteps();
      if (nonCompletedSteps.length === 1) this.finishBtn.style.display = "";
      else this.finishBtn.style.display = "none";
    }
    handleFinishButtonClick() {
      const uncompletedSteps = this.getUncompletedSteps();
      const uncompletedOrSkipSteps = this.getUncompletedSteps(true);
      const { el } = this.contentItems.find(({ isFinal }) => isFinal);
      if (uncompletedSteps.length) {
        uncompletedSteps.forEach(({ index }) => this.setCompleteItem(index));
      }
      this.currentIndex = this.totalSteps;
      this.setCurrentNavItem();
      this.hideAllContentItems();
      const currentNavItem = this.navItems.find(
        ({ index }) => index === this.currentIndex
      );
      const currentNavItemEl = currentNavItem ? currentNavItem.el : null;
      currentNavItemEl.classList.remove("active");
      el.style.display = "block";
      if (this.backBtn) this.backBtn.style.display = "none";
      if (this.nextBtn) this.nextBtn.style.display = "none";
      if (this.skipBtn) this.skipBtn.style.display = "none";
      if (this.completeStepBtn) this.completeStepBtn.style.display = "none";
      if (this.finishBtn) this.finishBtn.style.display = "none";
      if (this.resetBtn) this.resetBtn.style.display = "";
      if (uncompletedOrSkipSteps.length <= 1) {
        this.isCompleted = true;
        this.setCompleted();
      }
      this.fireEvent("finish", this.currentIndex);
      dispatch("finish.hs.stepper", this.el, this.currentIndex);
    }
    // reset
    buildResetButton() {
      if (!this.resetBtn) return;
      this.onResetBtnClickListener = () => this.resetBtnClick();
      this.resetBtn.addEventListener("click", this.onResetBtnClickListener);
    }
    handleResetButtonClick() {
      if (this.backBtn) this.backBtn.style.display = "";
      if (this.nextBtn) this.nextBtn.style.display = "";
      if (this.completeStepBtn) {
        this.completeStepBtn.style.display = "";
        this.completeStepBtn.innerText = this.completeStepBtnDefaultText;
        this.completeStepBtn.removeAttribute("disabled");
        this.completeStepBtn.classList.remove("disabled");
      }
      if (this.resetBtn) this.resetBtn.style.display = "none";
      this.navItems.forEach((item) => {
        const { el } = item;
        item.isSkip = false;
        item.isCompleted = false;
        this.unsetCurrentNavItemActions(el);
        el.classList.remove("success", "skipped");
      });
      this.contentItems.forEach((item) => {
        const { el } = item;
        item.isSkip = false;
        item.isCompleted = false;
        this.unsetCurrentContentItemActions(el);
        el.classList.remove("success", "skipped");
      });
      this.currentIndex = 1;
      this.unsetCompleted();
      this.isCompleted = false;
      this.showSkipButton();
      this.setCurrentNavItem();
      this.setCurrentContentItem();
      this.showFinishButton();
      this.showCompleteStepButton();
      this.checkForTheFirstStep();
      this.fireEvent("reset", this.currentIndex);
      dispatch("reset.hs.stepper", this.el, this.currentIndex);
    }
    // Public methods
    setProcessedNavItem(n) {
      const targetNavItem = this.getNavItem(n);
      if (!targetNavItem) return;
      this.setProcessedNavItemActions(targetNavItem);
    }
    unsetProcessedNavItem(n) {
      const targetNavItem = this.getNavItem(n);
      if (!targetNavItem) return;
      this.unsetProcessedNavItemActions(targetNavItem);
    }
    goToNext() {
      if (this.mode === "linear") this.setCompleteItem();
      this.handleNextButtonClick(this.mode !== "linear");
      if (this.mode === "linear" && this.currentIndex === this.totalSteps) {
        if (this.nextBtn) this.nextBtn.style.display = "none";
        if (this.completeStepBtn) this.completeStepBtn.style.display = "none";
      }
    }
    goToFinish() {
      this.handleFinishButtonClick();
    }
    disableButtons() {
      if (this.backBtn) this.setToDisabled(this.backBtn);
      if (this.nextBtn) this.setToDisabled(this.nextBtn);
    }
    enableButtons() {
      if (this.backBtn) this.setToNonDisabled(this.backBtn);
      if (this.nextBtn) this.setToNonDisabled(this.nextBtn);
    }
    setErrorNavItem(n) {
      const targetNavItem = this.getNavItem(n);
      if (!targetNavItem) return;
      this.setErrorNavItemActions(targetNavItem);
    }
    destroy() {
      this.el.classList.remove("completed");
      this.el.querySelectorAll("[data-hs-stepper-nav-item]").forEach((el) => {
        el.classList.remove("active", "success", "skipped", "disabled", "error");
        if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
          el.removeAttribute("disabled");
        }
      });
      this.el.querySelectorAll("[data-hs-stepper-content-item]").forEach((el) => {
        el.classList.remove("success", "skipped");
      });
      if (this.backBtn) this.backBtn.classList.remove("disabled");
      if (this.nextBtn) this.nextBtn.classList.remove("disabled");
      if (this.completeStepBtn) this.completeStepBtn.classList.remove("disabled");
      if (this.backBtn) this.backBtn.style.display = "";
      if (this.nextBtn) this.nextBtn.style.display = "";
      if (this.skipBtn) this.skipBtn.style.display = "";
      if (this.finishBtn) this.finishBtn.style.display = "none";
      if (this.resetBtn) this.resetBtn.style.display = "none";
      if (this.onNavItemClickListener.length) {
        this.onNavItemClickListener.forEach(({ el, fn }) => {
          el.removeEventListener("click", fn);
        });
      }
      if (this.backBtn) {
        this.backBtn.removeEventListener("click", this.onBackClickListener);
      }
      if (this.nextBtn) {
        this.nextBtn.removeEventListener("click", this.onNextClickListener);
      }
      if (this.skipBtn) {
        this.skipBtn.removeEventListener("click", this.onSkipClickListener);
      }
      if (this.completeStepBtn) {
        this.completeStepBtn.removeEventListener(
          "click",
          this.onCompleteStepBtnClickListener
        );
      }
      if (this.finishBtn) {
        this.finishBtn.removeEventListener(
          "click",
          this.onFinishBtnClickListener
        );
      }
      if (this.resetBtn) {
        this.resetBtn.removeEventListener("click", this.onResetBtnClickListener);
      }
      window.$hsStepperCollection = window.$hsStepperCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsStepperCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsStepperCollection) window.$hsStepperCollection = [];
      if (window.$hsStepperCollection) {
        window.$hsStepperCollection = window.$hsStepperCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll("[data-hs-stepper]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsStepperCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          new _HSStepper(el);
        }
      });
    }
  };
  window.addEventListener("load", () => {
    HSStepper.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSStepper = HSStepper;
  }
  var stepper_default = HSStepper;

  // node_modules/preline/src/plugins/strong-password/index.ts
  init_utils();
  init_base_plugin();
  var HSStrongPassword = class _HSStrongPassword extends HSBasePlugin {
    target;
    hints;
    stripClasses;
    minLength;
    mode;
    popoverSpace;
    checksExclude;
    specialCharactersSet;
    isOpened = false;
    strength = 0;
    passedRules = /* @__PURE__ */ new Set();
    weakness;
    rules;
    availableChecks;
    onTargetInputListener;
    onTargetFocusListener;
    onTargetBlurListener;
    onTargetInputSecondListener;
    onTargetInputThirdListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-strong-password");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.target = concatOptions?.target ? typeof concatOptions?.target === "string" ? document.querySelector(concatOptions.target) : concatOptions.target : null;
      this.hints = concatOptions?.hints ? typeof concatOptions?.hints === "string" ? document.querySelector(concatOptions.hints) : concatOptions.hints : null;
      this.stripClasses = concatOptions?.stripClasses || null;
      this.minLength = concatOptions?.minLength || 6;
      this.mode = concatOptions?.mode || "default";
      this.popoverSpace = concatOptions?.popoverSpace || 10;
      this.checksExclude = concatOptions?.checksExclude || [];
      this.availableChecks = [
        "lowercase",
        "uppercase",
        "numbers",
        "special-characters",
        "min-length"
      ].filter((el2) => !this.checksExclude.includes(el2));
      this.specialCharactersSet = concatOptions?.specialCharactersSet || "!\"#$%&'()*+,-./:;<=>?@[\\\\\\]^_`{|}~";
      if (this.target) this.init();
    }
    targetInput(evt) {
      this.setStrength(evt.target.value);
    }
    targetFocus() {
      this.isOpened = true;
      this.hints.classList.remove("hidden");
      this.hints.classList.add("block");
      this.recalculateDirection();
    }
    targetBlur() {
      this.isOpened = false;
      this.hints.classList.remove(
        "block",
        "bottom-full",
        "top-full"
      );
      this.hints.classList.add("hidden");
      this.hints.style.marginTop = "";
      this.hints.style.marginBottom = "";
    }
    targetInputSecond() {
      this.setWeaknessText();
    }
    targetInputThird() {
      this.setRulesText();
    }
    init() {
      this.createCollection(window.$hsStrongPasswordCollection, this);
      if (this.availableChecks.length) this.build();
    }
    build() {
      this.buildStrips();
      if (this.hints) this.buildHints();
      this.setStrength(this.target.value);
      this.onTargetInputListener = (evt) => this.targetInput(evt);
      this.target.addEventListener(
        "input",
        this.onTargetInputListener
      );
    }
    buildStrips() {
      this.el.innerHTML = "";
      if (this.stripClasses) {
        for (let i = 0; i < this.availableChecks.length; i++) {
          const newStrip = htmlToElement("<div></div>");
          classToClassList(this.stripClasses, newStrip);
          this.el.append(newStrip);
        }
      }
    }
    buildHints() {
      this.weakness = this.hints.querySelector(
        "[data-hs-strong-password-hints-weakness-text]"
      ) || null;
      this.rules = Array.from(
        this.hints.querySelectorAll(
          "[data-hs-strong-password-hints-rule-text]"
        )
      ) || null;
      this.rules.forEach((rule) => {
        const ruleValue = rule.getAttribute(
          "data-hs-strong-password-hints-rule-text"
        );
        if (this.checksExclude?.includes(ruleValue)) rule.remove();
      });
      if (this.weakness) this.buildWeakness();
      if (this.rules) this.buildRules();
      if (this.mode === "popover") {
        this.onTargetFocusListener = () => this.targetFocus();
        this.onTargetBlurListener = () => this.targetBlur();
        this.target.addEventListener(
          "focus",
          this.onTargetFocusListener
        );
        this.target.addEventListener(
          "blur",
          this.onTargetBlurListener
        );
      }
    }
    buildWeakness() {
      this.checkStrength(this.target.value);
      this.setWeaknessText();
      this.onTargetInputSecondListener = () => setTimeout(() => this.targetInputSecond());
      this.target.addEventListener(
        "input",
        this.onTargetInputSecondListener
      );
    }
    buildRules() {
      this.setRulesText();
      this.onTargetInputThirdListener = () => setTimeout(() => this.targetInputThird());
      this.target.addEventListener(
        "input",
        this.onTargetInputThirdListener
      );
    }
    setWeaknessText() {
      const weaknessText = this.weakness.getAttribute(
        "data-hs-strong-password-hints-weakness-text"
      );
      const weaknessTextToJson = JSON.parse(weaknessText);
      this.weakness.textContent = weaknessTextToJson[this.strength];
    }
    setRulesText() {
      this.rules.forEach((rule) => {
        const ruleValue = rule.getAttribute(
          "data-hs-strong-password-hints-rule-text"
        );
        this.checkIfPassed(rule, this.passedRules.has(ruleValue));
      });
    }
    togglePopover() {
      const popover = this.el.querySelector(".popover");
      if (popover) popover.classList.toggle("show");
    }
    checkStrength(val) {
      const passedRules = /* @__PURE__ */ new Set();
      const regexps = {
        lowercase: /[a-z]+/,
        uppercase: /[A-Z]+/,
        numbers: /[0-9]+/,
        "special-characters": new RegExp(`[${this.specialCharactersSet}]`)
      };
      let strength = 0;
      if (this.availableChecks.includes("lowercase") && val.match(regexps["lowercase"])) {
        strength += 1;
        passedRules.add("lowercase");
      }
      if (this.availableChecks.includes("uppercase") && val.match(regexps["uppercase"])) {
        strength += 1;
        passedRules.add("uppercase");
      }
      if (this.availableChecks.includes("numbers") && val.match(regexps["numbers"])) {
        strength += 1;
        passedRules.add("numbers");
      }
      if (this.availableChecks.includes("special-characters") && val.match(regexps["special-characters"])) {
        strength += 1;
        passedRules.add("special-characters");
      }
      if (this.availableChecks.includes("min-length") && val.length >= this.minLength) {
        strength += 1;
        passedRules.add("min-length");
      }
      if (!val.length) {
        strength = 0;
      }
      if (strength === this.availableChecks.length)
        this.el.classList.add("accepted");
      else this.el.classList.remove("accepted");
      this.strength = strength;
      this.passedRules = passedRules;
      return {
        strength: this.strength,
        rules: this.passedRules
      };
    }
    checkIfPassed(el, isRulePassed = false) {
      const check = el.querySelector("[data-check]");
      const uncheck = el.querySelector("[data-uncheck]");
      if (isRulePassed) {
        el.classList.add("active");
        check.classList.remove("hidden");
        uncheck.classList.add("hidden");
      } else {
        el.classList.remove("active");
        check.classList.add("hidden");
        uncheck.classList.remove("hidden");
      }
    }
    setStrength(val) {
      const { strength, rules } = this.checkStrength(val);
      const payload = {
        strength,
        rules
      };
      this.hideStrips(strength);
      this.fireEvent("change", payload);
      dispatch("change.hs.strongPassword", this.el, payload);
    }
    hideStrips(qty) {
      Array.from(this.el.children).forEach((el, i) => {
        if (i < qty) el.classList.add("passed");
        else el.classList.remove("passed");
      });
    }
    // Public methods
    recalculateDirection() {
      if (isEnoughSpace(
        this.hints,
        this.target,
        "bottom",
        this.popoverSpace
      )) {
        this.hints.classList.remove("bottom-full");
        this.hints.classList.add("top-full");
        this.hints.style.marginBottom = "";
        this.hints.style.marginTop = `${this.popoverSpace}px`;
      } else {
        this.hints.classList.remove("top-full");
        this.hints.classList.add("bottom-full");
        this.hints.style.marginTop = "";
        this.hints.style.marginBottom = `${this.popoverSpace}px`;
      }
    }
    destroy() {
      this.target.removeEventListener(
        "input",
        this.onTargetInputListener
      );
      this.target.removeEventListener(
        "focus",
        this.onTargetFocusListener
      );
      this.target.removeEventListener(
        "blur",
        this.onTargetBlurListener
      );
      this.target.removeEventListener(
        "input",
        this.onTargetInputSecondListener
      );
      this.target.removeEventListener(
        "input",
        this.onTargetInputThirdListener
      );
      window.$hsStrongPasswordCollection = window.$hsStrongPasswordCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsStrongPasswordCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsStrongPasswordCollection)
        window.$hsStrongPasswordCollection = [];
      if (window.$hsStrongPasswordCollection)
        window.$hsStrongPasswordCollection = window.$hsStrongPasswordCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll(
        "[data-hs-strong-password]:not(.--prevent-on-load-init)"
      ).forEach((el) => {
        if (!window.$hsStrongPasswordCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          const data = el.getAttribute("data-hs-strong-password");
          const options = data ? JSON.parse(data) : {};
          new _HSStrongPassword(el, options);
        }
      });
    }
  };
  window.addEventListener("load", () => {
    HSStrongPassword.autoInit();
  });
  document.addEventListener("scroll", () => {
    if (!window.$hsStrongPasswordCollection) return false;
    const target = window.$hsStrongPasswordCollection.find(
      (el) => el.element.isOpened
    );
    if (target) target.element.recalculateDirection();
  });
  if (typeof window !== "undefined") {
    window.HSStrongPassword = HSStrongPassword;
  }
  var strong_password_default = HSStrongPassword;

  // node_modules/preline/src/plugins/tabs/index.ts
  init_utils();
  init_base_plugin();
  init_accessibility_manager();
  init_constants();
  var HSTabs = class _HSTabs extends HSBasePlugin {
    accessibilityComponent;
    eventType;
    preventNavigationResolution;
    toggles;
    extraToggleId;
    extraToggle;
    current;
    currentContentId;
    currentContent;
    prev;
    prevContentId;
    prevContent;
    onToggleHandler;
    onExtraToggleChangeListener;
    constructor(el, options, events) {
      super(el, options, events);
      const data = el.getAttribute("data-hs-tabs");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.eventType = concatOptions.eventType ?? "click";
      this.preventNavigationResolution = typeof concatOptions.preventNavigationResolution === "number" ? concatOptions.preventNavigationResolution : BREAKPOINTS[concatOptions.preventNavigationResolution] || null;
      this.toggles = this.el.querySelectorAll("[data-hs-tab]");
      this.extraToggleId = this.el.getAttribute("data-hs-tab-select");
      this.extraToggle = this.extraToggleId ? document.querySelector(this.extraToggleId) : null;
      this.current = Array.from(this.toggles).find(
        (el2) => el2.classList.contains("active")
      );
      this.currentContentId = this.current?.getAttribute("data-hs-tab") || null;
      this.currentContent = this.currentContentId ? document.querySelector(this.currentContentId) : null;
      this.prev = null;
      this.prevContentId = null;
      this.prevContent = null;
      this.onToggleHandler = [];
      this.init();
    }
    toggle(el) {
      this.open(el);
    }
    extraToggleChange(evt) {
      this.change(evt);
    }
    init() {
      this.createCollection(window.$hsTabsCollection, this);
      this.toggles.forEach((el) => {
        const fn = (evt) => {
          if (this.eventType === "click" && this.preventNavigationResolution && document.body.clientWidth <= +this.preventNavigationResolution) evt.preventDefault();
          this.toggle(el);
        };
        const preventClickFn = (evt) => {
          if (this.preventNavigationResolution && document.body.clientWidth <= +this.preventNavigationResolution) evt.preventDefault();
        };
        this.onToggleHandler.push({ el, fn, preventClickFn });
        if (this.eventType === "click") el.addEventListener("click", fn);
        else {
          el.addEventListener("mouseenter", fn);
          el.addEventListener("click", preventClickFn);
        }
      });
      if (this.extraToggle) {
        this.onExtraToggleChangeListener = (evt) => this.extraToggleChange(evt);
        this.extraToggle.addEventListener(
          "change",
          this.onExtraToggleChangeListener
        );
      }
      if (typeof window !== "undefined") {
        if (!window.HSAccessibilityObserver) {
          window.HSAccessibilityObserver = new accessibility_manager_default();
        }
        this.setupAccessibility();
      }
    }
    open(el) {
      this.prev = this.current;
      this.prevContentId = this.currentContentId;
      this.prevContent = this.currentContent;
      this.current = el;
      this.currentContentId = el.getAttribute("data-hs-tab");
      this.currentContent = this.currentContentId ? document.querySelector(this.currentContentId) : null;
      if (this?.prev?.ariaSelected) {
        this.prev.ariaSelected = "false";
      }
      this.prev?.classList.remove("active");
      this.prevContent?.classList.add("hidden");
      if (this?.current?.ariaSelected) {
        this.current.ariaSelected = "true";
      }
      this.current.classList.add("active");
      this.currentContent?.classList.remove("hidden");
      this.fireEvent("change", {
        el,
        prev: this.prevContentId,
        current: this.currentContentId,
        tabsId: this.el.id
      });
      dispatch("change.hs.tab", el, {
        el,
        prev: this.prevContentId,
        current: this.currentContentId,
        tabsId: this.el.id
      });
    }
    change(evt) {
      const toggle = document.querySelector(
        `[data-hs-tab="${evt.target.value}"]`
      );
      if (toggle) {
        if (this.eventType === "hover") {
          toggle.dispatchEvent(new Event("mouseenter"));
        } else toggle.click();
      }
    }
    // Accessibility methods
    setupAccessibility() {
      this.accessibilityComponent = window.HSAccessibilityObserver.registerComponent(
        this.el,
        {
          onArrow: (evt) => {
            if (evt.metaKey) return;
            const isVertical = this.el.getAttribute("data-hs-tabs-vertical") === "true" || this.el.getAttribute("aria-orientation") === "vertical";
            switch (evt.key) {
              case (isVertical ? "ArrowUp" : "ArrowLeft"):
                this.onArrow(true);
                break;
              case (isVertical ? "ArrowDown" : "ArrowRight"):
                this.onArrow(false);
                break;
              case "Home":
                this.onStartEnd(true);
                break;
              case "End":
                this.onStartEnd(false);
                break;
            }
          }
        },
        true,
        "Tabs",
        '[role="tablist"]'
      );
    }
    onArrow(isOpposite = true) {
      const toggles = isOpposite ? Array.from(this.toggles).reverse() : Array.from(this.toggles);
      const focused = toggles.find((el) => document.activeElement === el);
      let focusedInd = toggles.findIndex((el) => el === focused);
      focusedInd = focusedInd + 1 < toggles.length ? focusedInd + 1 : 0;
      toggles[focusedInd].focus();
      toggles[focusedInd].click();
    }
    onStartEnd(isOpposite = true) {
      const toggles = isOpposite ? Array.from(this.toggles) : Array.from(this.toggles).reverse();
      if (toggles.length) {
        toggles[0].focus();
        toggles[0].click();
      }
    }
    // Public methods
    destroy() {
      this.toggles.forEach((toggle) => {
        const _toggle = this.onToggleHandler?.find(({ el }) => el === toggle);
        if (_toggle) {
          if (this.eventType === "click") {
            toggle.removeEventListener("click", _toggle.fn);
          } else {
            toggle.removeEventListener("mouseenter", _toggle.fn);
            toggle.removeEventListener("click", _toggle.preventClickFn);
          }
        }
      });
      this.onToggleHandler = [];
      if (this.extraToggle) {
        this.extraToggle.removeEventListener(
          "change",
          this.onExtraToggleChangeListener
        );
      }
      if (typeof window !== "undefined" && window.HSAccessibilityObserver) {
        window.HSAccessibilityObserver.unregisterComponent(
          this.accessibilityComponent
        );
      }
      window.$hsTabsCollection = window.$hsTabsCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsTabsCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsTabsCollection) {
        window.$hsTabsCollection = [];
      }
      if (window.$hsTabsCollection) {
        window.$hsTabsCollection = window.$hsTabsCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll(
        '[role="tablist"]:not(select):not(.--prevent-on-load-init)'
      ).forEach((el) => {
        if (!window.$hsTabsCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          new _HSTabs(el);
        }
      });
    }
    static open(target) {
      const elInCollection = window.$hsTabsCollection.find(
        (el) => Array.from(el.element.toggles).includes(
          typeof target === "string" ? document.querySelector(target) : target
        )
      );
      const targetInCollection = elInCollection ? Array.from(elInCollection.element.toggles).find(
        (el) => el === (typeof target === "string" ? document.querySelector(target) : target)
      ) : null;
      if (targetInCollection && !targetInCollection.classList.contains("active")) {
        elInCollection.element.open(targetInCollection);
      }
    }
    // Backward compatibility
    static on(evt, target, cb) {
      const elInCollection = window.$hsTabsCollection.find(
        (el) => Array.from(el.element.toggles).includes(
          typeof target === "string" ? document.querySelector(target) : target
        )
      );
      if (elInCollection) elInCollection.element.events[evt] = cb;
    }
  };
  window.addEventListener("load", () => {
    HSTabs.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSTabs = HSTabs;
  }
  var tabs_default = HSTabs;

  // node_modules/preline/src/plugins/textarea-auto-height/index.ts
  init_base_plugin();
  var HSTextareaAutoHeight = class _HSTextareaAutoHeight extends HSBasePlugin {
    defaultHeight;
    onElementInputListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-copy-markup");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.defaultHeight = concatOptions?.defaultHeight || 0;
      this.init();
    }
    elementInput() {
      this.textareaSetHeight(3);
    }
    init() {
      this.createCollection(window.$hsTextareaAutoHeightCollection, this);
      this.setAutoHeight();
    }
    setAutoHeight() {
      if (this.isParentHidden()) this.callbackAccordingToType();
      else this.textareaSetHeight(3);
      this.onElementInputListener = () => this.elementInput();
      this.el.addEventListener("input", this.onElementInputListener);
    }
    textareaSetHeight(offsetTop = 0) {
      this.el.style.height = "auto";
      this.el.style.height = this.checkIfOneLine() && this.defaultHeight ? `${this.defaultHeight}px` : `${this.el.scrollHeight + offsetTop}px`;
    }
    checkIfOneLine() {
      const clientHeight = this.el.clientHeight;
      const scrollHeight = this.el.scrollHeight;
      if (scrollHeight > clientHeight) return false;
      else return true;
    }
    isParentHidden() {
      return this.el.closest(".hs-overlay.hidden") || this.el.closest('[role="tabpanel"].hidden') || this.el.closest(".hs-collapse.hidden");
    }
    parentType() {
      if (this.el.closest(".hs-collapse")) return "collapse";
      else if (this.el.closest(".hs-overlay")) return "overlay";
      else if (this.el.closest('[role="tabpanel"]')) return "tabs";
      else return false;
    }
    callbackAccordingToType() {
      if (this.parentType() === "collapse") {
        const collapseId = this.el.closest(".hs-collapse").id;
        const { element } = window.HSCollapse.getInstance(
          `[data-hs-collapse="#${collapseId}"]`,
          true
        );
        element.on("beforeOpen", () => {
          if (!this.el) return false;
          this.textareaSetHeight(3);
        });
      } else if (this.parentType() === "overlay") {
        const overlay = window.HSOverlay.getInstance(this.el.closest(".hs-overlay"), true);
        overlay.element.on("open", () => {
          const collection = window.$hsTextareaAutoHeightCollection.filter(({ element }) => element.el.closest(".hs-overlay") === overlay.element.el);
          collection.forEach(({ element }) => element.textareaSetHeight(3));
        });
      } else if (this.parentType() === "tabs") {
        const tabId = this.el.closest('[role="tabpanel"]')?.id;
        const tab = document.querySelector(`[data-hs-tab="#${tabId}"]`);
        const tabs = tab.closest('[role="tablist"]');
        const { element } = window.HSTabs.getInstance(tabs, true) || null;
        element.on("change", (payload) => {
          const textareas = document.querySelectorAll(`${payload.current} [data-hs-textarea-auto-height]`);
          if (!textareas.length) return false;
          textareas.forEach((el) => {
            const instance = window.HSTextareaAutoHeight.getInstance(el, true) || null;
            if (instance) instance.element.textareaSetHeight(3);
          });
        });
      } else return false;
    }
    // Public methods
    destroy() {
      this.el.removeEventListener("input", this.onElementInputListener);
      window.$hsTextareaAutoHeightCollection = window.$hsTextareaAutoHeightCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static method
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsTextareaAutoHeightCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsTextareaAutoHeightCollection)
        window.$hsTextareaAutoHeightCollection = [];
      if (window.$hsTextareaAutoHeightCollection)
        window.$hsTextareaAutoHeightCollection = window.$hsTextareaAutoHeightCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll(
        "[data-hs-textarea-auto-height]:not(.--prevent-on-load-init)"
      ).forEach((el) => {
        if (!window.$hsTextareaAutoHeightCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          const data = el.getAttribute("data-hs-textarea-auto-height");
          const options = data ? JSON.parse(data) : {};
          new _HSTextareaAutoHeight(el, options);
        }
      });
    }
  };
  window.addEventListener("load", () => {
    HSTextareaAutoHeight.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSTextareaAutoHeight = HSTextareaAutoHeight;
  }
  var textarea_auto_height_default = HSTextareaAutoHeight;

  // node_modules/preline/src/plugins/theme-switch/index.ts
  init_base_plugin();
  var HSThemeSwitch = class _HSThemeSwitch extends HSBasePlugin {
    theme;
    type;
    onElementChangeListener;
    onElementClickListener;
    static systemThemeObserver = null;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-theme-switch");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.theme = concatOptions?.theme || localStorage.getItem("hs_theme") || "default";
      this.type = concatOptions?.type || "change";
      this.init();
    }
    elementChange(evt) {
      const theme = evt.target.checked ? "dark" : "default";
      this.setAppearance(theme);
      this.toggleObserveSystemTheme();
    }
    elementClick(theme) {
      this.setAppearance(theme);
      this.toggleObserveSystemTheme();
    }
    init() {
      this.createCollection(window.$hsThemeSwitchCollection, this);
      if (this.theme !== "default") this.setAppearance();
      if (this.type === "click") this.buildSwitchTypeOfClick();
      else this.buildSwitchTypeOfChange();
    }
    buildSwitchTypeOfChange() {
      this.el.checked = this.theme === "dark";
      this.toggleObserveSystemTheme();
      this.onElementChangeListener = (evt) => this.elementChange(evt);
      this.el.addEventListener("change", this.onElementChangeListener);
    }
    buildSwitchTypeOfClick() {
      const theme = this.el.getAttribute("data-hs-theme-click-value");
      this.toggleObserveSystemTheme();
      this.onElementClickListener = () => this.elementClick(theme);
      this.el.addEventListener("click", this.onElementClickListener);
    }
    setResetStyles() {
      const style = document.createElement("style");
      style.innerText = `*{transition: unset !important;}`;
      style.setAttribute("data-hs-appearance-onload-styles", "");
      document.head.appendChild(style);
      return style;
    }
    addSystemThemeObserver() {
      if (_HSThemeSwitch.systemThemeObserver) return;
      _HSThemeSwitch.systemThemeObserver = (e2) => {
        window.$hsThemeSwitchCollection?.forEach((instance) => {
          if (localStorage.getItem("hs_theme") === "auto") {
            instance.element.setAppearance("auto", false);
          }
        });
      };
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", _HSThemeSwitch.systemThemeObserver);
    }
    removeSystemThemeObserver() {
      if (!_HSThemeSwitch.systemThemeObserver) return;
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", _HSThemeSwitch.systemThemeObserver);
      _HSThemeSwitch.systemThemeObserver = null;
    }
    toggleObserveSystemTheme() {
      if (localStorage.getItem("hs_theme") === "auto") {
        this.addSystemThemeObserver();
      } else this.removeSystemThemeObserver();
    }
    // Public methods
    setAppearance(theme = this.theme, isSaveToLocalStorage = true, isSetDispatchEvent = true) {
      const html = document.querySelector("html");
      const resetStyles = this.setResetStyles();
      if (isSaveToLocalStorage) localStorage.setItem("hs_theme", theme);
      let computedTheme = theme;
      if (computedTheme === "default") computedTheme = "light";
      if (computedTheme === "auto") {
        computedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      html.classList.remove("light", "dark", "default", "auto");
      if (theme === "auto") {
        html.classList.add("auto", computedTheme);
      } else {
        html.classList.add(computedTheme);
      }
      setTimeout(() => resetStyles.remove());
      if (isSetDispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("on-hs-appearance-change", { detail: theme })
        );
      }
    }
    destroy() {
      if (this.type === "change") {
        this.el.removeEventListener("change", this.onElementChangeListener);
      }
      if (this.type === "click") {
        this.el.removeEventListener("click", this.onElementClickListener);
      }
      window.$hsThemeSwitchCollection = window.$hsThemeSwitchCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsThemeSwitchCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsThemeSwitchCollection) window.$hsThemeSwitchCollection = [];
      if (window.$hsThemeSwitchCollection) {
        window.$hsThemeSwitchCollection = window.$hsThemeSwitchCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll("[data-hs-theme-switch]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsThemeSwitchCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          new _HSThemeSwitch(el, { type: "change" });
        }
      });
      document.querySelectorAll(
        "[data-hs-theme-click-value]:not(.--prevent-on-load-init)"
      ).forEach((el) => {
        if (!window.$hsThemeSwitchCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          new _HSThemeSwitch(el, { type: "click" });
        }
      });
    }
  };
  window.addEventListener("load", () => {
    HSThemeSwitch.autoInit();
  });
  if (window.$hsThemeSwitchCollection) {
    window.addEventListener(
      "on-hs-appearance-change",
      (evt) => {
        window.$hsThemeSwitchCollection.forEach((el) => {
          el.element.el.checked = evt.detail === "dark";
        });
      }
    );
  }
  if (typeof window !== "undefined") {
    window.HSThemeSwitch = HSThemeSwitch;
  }
  var theme_switch_default = HSThemeSwitch;

  // node_modules/preline/src/plugins/toggle-count/index.ts
  init_base_plugin();
  var HSToggleCount = class _HSToggleCount extends HSBasePlugin {
    target;
    min;
    max;
    duration;
    isChecked;
    onToggleChangeListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-toggle-count");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.target = concatOptions?.target ? typeof concatOptions?.target === "string" ? document.querySelector(concatOptions.target) : concatOptions.target : null;
      this.min = concatOptions?.min || 0;
      this.max = concatOptions?.max || 0;
      this.duration = concatOptions?.duration || 700;
      this.isChecked = this.target.checked || false;
      if (this.target) this.init();
    }
    toggleChange() {
      this.isChecked = !this.isChecked;
      this.toggle();
    }
    init() {
      this.createCollection(window.$hsToggleCountCollection, this);
      if (this.isChecked) this.el.innerText = String(this.max);
      this.onToggleChangeListener = () => this.toggleChange();
      this.target.addEventListener("change", this.onToggleChangeListener);
    }
    toggle() {
      if (this.isChecked) this.countUp();
      else this.countDown();
    }
    animate(from, to) {
      let startTimestamp = 0;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min(
          (timestamp - startTimestamp) / this.duration,
          1
        );
        this.el.innerText = String(Math.floor(progress * (to - from) + from));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
    // Public methods
    countUp() {
      this.animate(this.min, this.max);
    }
    countDown() {
      this.animate(this.max, this.min);
    }
    destroy() {
      this.target.removeEventListener("change", this.onToggleChangeListener);
      window.$hsToggleCountCollection = window.$hsToggleCountCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsToggleCountCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsToggleCountCollection) window.$hsToggleCountCollection = [];
      if (window.$hsToggleCountCollection)
        window.$hsToggleCountCollection = window.$hsToggleCountCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll("[data-hs-toggle-count]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsToggleCountCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSToggleCount(el);
      });
    }
  };
  window.addEventListener("load", () => {
    HSToggleCount.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSToggleCount = HSToggleCount;
  }
  var toggle_count_default = HSToggleCount;

  // node_modules/preline/src/plugins/toggle-password/index.ts
  init_utils();
  init_base_plugin();
  var HSTogglePassword = class _HSTogglePassword extends HSBasePlugin {
    target;
    isShown;
    isMultiple;
    eventType;
    onElementActionListener;
    constructor(el, options) {
      super(el, options);
      const data = el.getAttribute("data-hs-toggle-password");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      const targets = [];
      if (concatOptions?.target && typeof concatOptions?.target === "string") {
        const ids = concatOptions?.target.split(",");
        ids.forEach((id) => {
          targets.push(document.querySelector(id));
        });
      } else if (concatOptions?.target && typeof concatOptions?.target === "object") {
        concatOptions.target.forEach(
          (el2) => targets.push(document.querySelector(el2))
        );
      } else {
        concatOptions.target.forEach(
          (el2) => targets.push(el2)
        );
      }
      this.target = targets;
      this.isShown = this.el.hasAttribute("type") ? this.el.checked : false;
      this.eventType = isFormElement(this.el) ? "change" : "click";
      this.isMultiple = this.target.length > 1 && !!this.el.closest("[data-hs-toggle-password-group]");
      if (this.target) this.init();
    }
    elementAction() {
      if (this.isShown) {
        this.hide();
      } else {
        this.show();
      }
      this.fireEvent("toggle", this.target);
      dispatch("toggle.hs.toggle-select", this.el, this.target);
    }
    init() {
      this.createCollection(window.$hsTogglePasswordCollection, this);
      if (!this.isShown) {
        this.hide();
      } else {
        this.show();
      }
      this.onElementActionListener = () => this.elementAction();
      this.el.addEventListener(this.eventType, this.onElementActionListener);
    }
    getMultipleToggles() {
      const group = this.el.closest("[data-hs-toggle-password-group]");
      const toggles = group.querySelectorAll("[data-hs-toggle-password]");
      const togglesInCollection = [];
      toggles.forEach((el) => {
        togglesInCollection.push(
          _HSTogglePassword.getInstance(el)
        );
      });
      return togglesInCollection;
    }
    // Public methods
    show() {
      if (this.isMultiple) {
        const toggles = this.getMultipleToggles();
        toggles.forEach(
          (el) => el ? el.isShown = true : false
        );
        this.el.closest("[data-hs-toggle-password-group]").classList.add("active");
      } else {
        this.isShown = true;
        this.el.classList.add("active");
      }
      this.target.forEach((el) => {
        el.type = "text";
      });
    }
    hide() {
      if (this.isMultiple) {
        const toggles = this.getMultipleToggles();
        toggles.forEach(
          (el) => el ? el.isShown = false : false
        );
        this.el.closest("[data-hs-toggle-password-group]").classList.remove("active");
      } else {
        this.isShown = false;
        this.el.classList.remove("active");
      }
      this.target.forEach((el) => {
        el.type = "password";
      });
    }
    destroy() {
      if (this.isMultiple) {
        this.el.closest("[data-hs-toggle-password-group]").classList.remove("active");
      } else {
        this.el.classList.remove("active");
      }
      this.target.forEach((el) => {
        el.type = "password";
      });
      this.el.removeEventListener(this.eventType, this.onElementActionListener);
      this.isShown = false;
      window.$hsTogglePasswordCollection = window.$hsTogglePasswordCollection.filter(
        ({ element }) => element.el !== this.el
      );
    }
    // Static methods
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsTogglePasswordCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
    }
    static autoInit() {
      if (!window.$hsTogglePasswordCollection)
        window.$hsTogglePasswordCollection = [];
      if (window.$hsTogglePasswordCollection)
        window.$hsTogglePasswordCollection = window.$hsTogglePasswordCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll(
        "[data-hs-toggle-password]:not(.--prevent-on-load-init)"
      ).forEach((el) => {
        if (!window.$hsTogglePasswordCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSTogglePassword(el);
      });
    }
  };
  window.addEventListener("load", () => {
    HSTogglePassword.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSTogglePassword = HSTogglePassword;
  }
  var toggle_password_default = HSTogglePassword;

  // node_modules/preline/src/plugins/tooltip/index.ts
  init_utils();
  init_base_plugin();
  init_constants();
  var HSTooltip = class _HSTooltip extends HSBasePlugin {
    toggle;
    content;
    eventMode;
    preventFloatingUI;
    placement;
    strategy;
    scope;
    cleanupAutoUpdate = null;
    onToggleClickListener;
    onToggleFocusListener;
    onToggleBlurListener;
    onToggleMouseEnterListener;
    onToggleMouseLeaveListener;
    onToggleHandleListener;
    constructor(el, options, events) {
      super(el, options, events);
      if (this.el) {
        this.toggle = this.el.querySelector(".hs-tooltip-toggle") || this.el;
        this.content = this.el.querySelector(".hs-tooltip-content");
        this.eventMode = getClassProperty(this.el, "--trigger") || "hover";
        this.preventFloatingUI = getClassProperty(
          this.el,
          "--prevent-popper",
          "false"
        );
        this.placement = getClassProperty(this.el, "--placement") || "top";
        this.strategy = getClassProperty(this.el, "--strategy");
        this.scope = getClassProperty(this.el, "--scope") || "parent";
      }
      if (this.el && this.toggle && this.content) this.init();
    }
    toggleClick() {
      this.click();
    }
    toggleFocus() {
      this.focus();
    }
    toggleMouseEnter() {
      this.enter();
    }
    toggleMouseLeave() {
      this.leave();
    }
    toggleHandle() {
      this.hide();
      this.toggle.removeEventListener("click", this.onToggleHandleListener, true);
      this.toggle.removeEventListener("blur", this.onToggleHandleListener, true);
    }
    init() {
      this.createCollection(window.$hsTooltipCollection, this);
      this.onToggleFocusListener = () => this.enter();
      this.onToggleBlurListener = () => this.hide();
      this.toggle.addEventListener("focus", this.onToggleFocusListener);
      this.toggle.addEventListener("blur", this.onToggleBlurListener);
      if (this.eventMode === "click") {
        this.onToggleClickListener = () => this.toggleClick();
        this.toggle.addEventListener("click", this.onToggleClickListener);
      } else if (this.eventMode === "hover") {
        this.onToggleMouseEnterListener = () => this.toggleMouseEnter();
        this.onToggleMouseLeaveListener = () => this.toggleMouseLeave();
        this.toggle.addEventListener(
          "mouseenter",
          this.onToggleMouseEnterListener
        );
        this.toggle.addEventListener(
          "mouseleave",
          this.onToggleMouseLeaveListener
        );
      }
      if (this.preventFloatingUI === "false") this.buildFloatingUI();
    }
    enter() {
      this._show();
    }
    leave() {
      this.hide();
    }
    click() {
      if (this.el.classList.contains("show")) return false;
      this._show();
      this.onToggleHandleListener = () => {
        setTimeout(() => this.toggleHandle());
      };
      this.toggle.addEventListener("click", this.onToggleHandleListener, true);
      this.toggle.addEventListener("blur", this.onToggleHandleListener, true);
    }
    focus() {
      this._show();
    }
    async positionTooltip(placement) {
      const actualPlacement = placement === "auto" ? "top" : placement;
      const fallbackPlacements = placement === "auto" ? ["bottom", "left", "right"] : this.getFallbackPlacements(actualPlacement);
      const middlewareArr = [
        offset2(5),
        flip2({ fallbackPlacements })
      ];
      const result = await computePosition2(this.toggle, this.content, {
        placement: actualPlacement,
        strategy: this.strategy || "fixed",
        middleware: middlewareArr
      });
      return result;
    }
    getFallbackPlacements(placement) {
      switch (placement) {
        case "top":
          return ["bottom", "left", "right"];
        case "bottom":
          return ["top", "left", "right"];
        case "left":
          return ["right", "top", "bottom"];
        case "right":
          return ["left", "top", "bottom"];
        case "top-start":
          return ["bottom-start", "top-end", "bottom-end"];
        case "top-end":
          return ["bottom-end", "top-start", "bottom-start"];
        case "bottom-start":
          return ["top-start", "bottom-end", "top-end"];
        case "bottom-end":
          return ["top-end", "bottom-start", "top-start"];
        case "left-start":
          return ["right-start", "left-end", "right-end"];
        case "left-end":
          return ["right-end", "left-start", "right-start"];
        case "right-start":
          return ["left-start", "right-end", "left-end"];
        case "right-end":
          return ["left-end", "right-start", "left-start"];
        default:
          return ["top", "bottom", "left", "right"];
      }
    }
    applyTooltipPosition(x, y, placement) {
      Object.assign(this.content.style, {
        position: this.strategy || "fixed",
        left: `${x}px`,
        top: `${y}px`
      });
      this.content.setAttribute("data-placement", placement);
    }
    buildFloatingUI() {
      if (this.scope === "window") document.body.appendChild(this.content);
      const isAutoPlacement = this.placement.startsWith("auto");
      const originalPlacement = getClassProperty(this.el, "--placement");
      const isDefaultPlacement = !originalPlacement || originalPlacement === "";
      const targetPlacement = isAutoPlacement ? "auto" : isDefaultPlacement ? "auto" : POSITIONS[this.placement] || this.placement;
      this.positionTooltip(targetPlacement).then((result) => {
        this.applyTooltipPosition(result.x, result.y, result.placement);
      });
      this.cleanupAutoUpdate = autoUpdate(this.toggle, this.content, () => {
        this.positionTooltip(targetPlacement).then((result) => {
          Object.assign(this.content.style, {
            position: this.strategy || "fixed",
            left: `${result.x}px`,
            top: `${result.y}px`
          });
          this.content.setAttribute("data-placement", result.placement);
        });
      });
    }
    _show() {
      this.content.classList.remove("hidden");
      if (this.scope === "window") this.content.classList.add("show");
      if (this.preventFloatingUI === "false" && !this.cleanupAutoUpdate) {
        this.buildFloatingUI();
      }
      setTimeout(() => {
        this.el.classList.add("show");
        this.fireEvent("show", this.el);
        dispatch("show.hs.tooltip", this.el, this.el);
      });
    }
    // Public methods
    show() {
      if (this.eventMode === "click") {
        this.click();
      } else {
        this.enter();
      }
      this.toggle.focus();
      this.toggle.style.outline = "none";
    }
    hide() {
      this.el.classList.remove("show");
      if (this.scope === "window") this.content.classList.remove("show");
      if (this.preventFloatingUI === "false" && this.cleanupAutoUpdate) {
        this.cleanupAutoUpdate();
        this.cleanupAutoUpdate = null;
      }
      this.fireEvent("hide", this.el);
      dispatch("hide.hs.tooltip", this.el, this.el);
      afterTransition(this.content, () => {
        if (this.el.classList.contains("show")) return false;
        this.content.classList.add("hidden");
        this.toggle.style.outline = "";
      });
    }
    destroy() {
      this.el.classList.remove("show");
      this.content.classList.add("hidden");
      this.toggle.removeEventListener("focus", this.onToggleFocusListener);
      this.toggle.removeEventListener("blur", this.onToggleBlurListener);
      if (this.eventMode === "click") {
        this.toggle.removeEventListener("click", this.onToggleClickListener);
      } else if (this.eventMode === "hover") {
        this.toggle.removeEventListener(
          "mouseenter",
          this.onToggleMouseEnterListener
        );
        this.toggle.removeEventListener(
          "mouseleave",
          this.onToggleMouseLeaveListener
        );
      }
      this.toggle.removeEventListener("click", this.onToggleHandleListener, true);
      this.toggle.removeEventListener("blur", this.onToggleHandleListener, true);
      if (this.cleanupAutoUpdate) {
        this.cleanupAutoUpdate();
        this.cleanupAutoUpdate = null;
      }
      window.$hsTooltipCollection = window.$hsTooltipCollection.filter(({ element }) => element.el !== this.el);
    }
    // Static methods
    static findInCollection(target) {
      return window.$hsTooltipCollection.find((el) => {
        if (target instanceof _HSTooltip) return el.element.el === target.el;
        else if (typeof target === "string") {
          return el.element.el === document.querySelector(target);
        } else return el.element.el === target;
      }) || null;
    }
    static getInstance(target, isInstance = false) {
      const elInCollection = window.$hsTooltipCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsTooltipCollection) window.$hsTooltipCollection = [];
      if (window.$hsTooltipCollection) {
        window.$hsTooltipCollection = window.$hsTooltipCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      }
      document.querySelectorAll(".hs-tooltip:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsTooltipCollection.find(
          (elC) => elC?.element?.el === el
        )) {
          new _HSTooltip(el);
        }
      });
    }
    static show(target) {
      const instance = _HSTooltip.findInCollection(target);
      if (instance) instance.element.show();
    }
    static hide(target) {
      const instance = _HSTooltip.findInCollection(target);
      if (instance) instance.element.hide();
    }
    // Backward compatibility
    static on(evt, target, cb) {
      const instance = _HSTooltip.findInCollection(target);
      if (instance) instance.element.events[evt] = cb;
    }
  };
  window.addEventListener("load", () => {
    HSTooltip.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSTooltip = HSTooltip;
  }
  var tooltip_default = HSTooltip;

  // node_modules/preline/src/plugins/tree-view/index.ts
  init_utils();
  init_base_plugin();
  var HSTreeView = class _HSTreeView extends HSBasePlugin {
    items = [];
    controlBy;
    autoSelectChildren;
    isIndeterminate;
    static group = 0;
    onElementClickListener;
    onControlChangeListener;
    constructor(el, options, events) {
      super(el, options, events);
      const data = el.getAttribute("data-hs-tree-view");
      const dataOptions = data ? JSON.parse(data) : {};
      const concatOptions = {
        ...dataOptions,
        ...options
      };
      this.controlBy = concatOptions?.controlBy || "button";
      this.autoSelectChildren = concatOptions?.autoSelectChildren || false;
      this.isIndeterminate = concatOptions?.isIndeterminate || true;
      this.onElementClickListener = [];
      this.onControlChangeListener = [];
      this.init();
    }
    elementClick(evt, el, data) {
      evt.stopPropagation();
      if (el.classList.contains("disabled")) return false;
      if (!evt.metaKey && !evt.shiftKey) this.unselectItem(data);
      this.selectItem(el, data);
      this.fireEvent("click", {
        el,
        data
      });
      dispatch("click.hs.treeView", this.el, {
        el,
        data
      });
    }
    controlChange(el, data) {
      if (this.autoSelectChildren) {
        this.selectItem(el, data);
        if (data.isDir) this.selectChildren(el, data);
        this.toggleParent(el);
      } else this.selectItem(el, data);
    }
    init() {
      this.createCollection(window.$hsTreeViewCollection, this);
      _HSTreeView.group += 1;
      this.initItems();
    }
    initItems() {
      this.el.querySelectorAll("[data-hs-tree-view-item]").forEach((el, ind) => {
        const data = JSON.parse(el.getAttribute("data-hs-tree-view-item"));
        if (!el.id) el.id = `tree-view-item-${_HSTreeView.group}-${ind}`;
        const concatData = {
          ...data,
          id: data.id ?? el.id,
          path: this.getPath(el),
          isSelected: data.isSelected ?? false
        };
        this.items.push(concatData);
        if (this.controlBy === "checkbox") this.controlByCheckbox(el, concatData);
        else this.controlByButton(el, concatData);
      });
    }
    controlByButton(el, data) {
      this.onElementClickListener.push({
        el,
        fn: (evt) => this.elementClick(evt, el, data)
      });
      el.addEventListener(
        "click",
        this.onElementClickListener.find((elI) => elI.el === el).fn
      );
    }
    controlByCheckbox(el, data) {
      const control = el.querySelector(`input[value="${data.value}"]`);
      if (!!control) {
        this.onControlChangeListener.push({
          el: control,
          fn: () => this.controlChange(el, data)
        });
        control.addEventListener(
          "change",
          this.onControlChangeListener.find((elI) => elI.el === control).fn
        );
      }
    }
    getItem(id) {
      return this.items.find((el) => el.id === id);
    }
    getPath(el) {
      const path = [];
      let parent = el.closest("[data-hs-tree-view-item]");
      while (!!parent) {
        const data = JSON.parse(parent.getAttribute("data-hs-tree-view-item"));
        path.push(data.value);
        parent = parent.parentElement?.closest("[data-hs-tree-view-item]");
      }
      return path.reverse().join("/");
    }
    unselectItem(exception = null) {
      let selectedItems = this.getSelectedItems();
      if (exception)
        selectedItems = selectedItems.filter((el) => el.id !== exception.id);
      if (selectedItems.length) {
        selectedItems.forEach((el) => {
          const selectedElement = document.querySelector(`#${el.id}`);
          selectedElement.classList.remove("selected");
          this.changeItemProp(el.id, "isSelected", false);
        });
      }
    }
    selectItem(el, data) {
      if (data.isSelected) {
        el.classList.remove("selected");
        this.changeItemProp(data.id, "isSelected", false);
      } else {
        el.classList.add("selected");
        this.changeItemProp(data.id, "isSelected", true);
      }
    }
    selectChildren(el, data) {
      const items = el.querySelectorAll("[data-hs-tree-view-item]");
      Array.from(items).filter((elI) => !elI.classList.contains("disabled")).forEach((elI) => {
        const initialItemData = elI.id ? this.getItem(elI.id) : null;
        if (!initialItemData) return false;
        if (data.isSelected) {
          elI.classList.add("selected");
          this.changeItemProp(initialItemData.id, "isSelected", true);
        } else {
          elI.classList.remove("selected");
          this.changeItemProp(initialItemData.id, "isSelected", false);
        }
        const currentItemData = this.getItem(elI.id);
        const control = elI.querySelector(
          `input[value="${currentItemData.value}"]`
        );
        if (this.isIndeterminate) control.indeterminate = false;
        if (currentItemData.isSelected) control.checked = true;
        else control.checked = false;
      });
    }
    toggleParent(el) {
      let parent = el.parentElement?.closest("[data-hs-tree-view-item]");
      while (!!parent) {
        const items = parent.querySelectorAll(
          "[data-hs-tree-view-item]:not(.disabled)"
        );
        const data = JSON.parse(parent.getAttribute("data-hs-tree-view-item"));
        const control = parent.querySelector(
          `input[value="${data.value}"]`
        );
        let hasUnchecked = false;
        let checkedItems = 0;
        items.forEach((elI) => {
          const dataI = this.getItem(elI.id);
          if (dataI.isSelected) checkedItems += 1;
          if (!dataI.isSelected) hasUnchecked = true;
        });
        if (hasUnchecked) {
          parent.classList.remove("selected");
          this.changeItemProp(parent.id, "isSelected", false);
          control.checked = false;
        } else {
          parent.classList.add("selected");
          this.changeItemProp(parent.id, "isSelected", true);
          control.checked = true;
        }
        if (this.isIndeterminate) {
          if (checkedItems > 0 && checkedItems < items.length)
            control.indeterminate = true;
          else control.indeterminate = false;
        }
        parent = parent.parentElement?.closest("[data-hs-tree-view-item]");
      }
    }
    // Public methods
    update() {
      this.items.map((el) => {
        const selector = document.querySelector(`#${el.id}`);
        if (el.path !== this.getPath(selector)) el.path = this.getPath(selector);
        return el;
      });
    }
    getSelectedItems() {
      return this.items.filter((el) => el.isSelected);
    }
    changeItemProp(id, prop, val) {
      this.items.map((el) => {
        if (el.id === id) el[prop] = val;
        return el;
      });
    }
    destroy() {
      this.onElementClickListener.forEach(({ el, fn }) => {
        el.removeEventListener("click", fn);
      });
      if (this.onControlChangeListener.length)
        this.onElementClickListener.forEach(({ el, fn }) => {
          el.removeEventListener("change", fn);
        });
      this.unselectItem();
      this.items = [];
      window.$hsTreeViewCollection = window.$hsTreeViewCollection.filter(
        ({ element }) => element.el !== this.el
      );
      _HSTreeView.group -= 1;
    }
    // Static methods
    static findInCollection(target) {
      return window.$hsTreeViewCollection.find((el) => {
        if (target instanceof _HSTreeView) return el.element.el === target.el;
        else if (typeof target === "string") return el.element.el === document.querySelector(target);
        else return el.element.el === target;
      }) || null;
    }
    static getInstance(target, isInstance) {
      const elInCollection = window.$hsTreeViewCollection.find(
        (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
      );
      return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
    }
    static autoInit() {
      if (!window.$hsTreeViewCollection) window.$hsTreeViewCollection = [];
      if (window.$hsTreeViewCollection)
        window.$hsTreeViewCollection = window.$hsTreeViewCollection.filter(
          ({ element }) => document.contains(element.el)
        );
      document.querySelectorAll("[data-hs-tree-view]:not(.--prevent-on-load-init)").forEach((el) => {
        if (!window.$hsTreeViewCollection.find(
          (elC) => elC?.element?.el === el
        ))
          new _HSTreeView(el);
      });
    }
    // Backward compatibility
    static on(evt, target, cb) {
      const instance = _HSTreeView.findInCollection(target);
      if (instance) instance.element.events[evt] = cb;
    }
  };
  window.addEventListener("load", () => {
    HSTreeView.autoInit();
  });
  if (typeof window !== "undefined") {
    window.HSTreeView = HSTreeView;
  }
  var tree_view_default = HSTreeView;

  // node_modules/preline/src/static/index.ts
  init_utils();

  // node_modules/preline/src/spa/index.ts
  init_select();
  var HSDataTable2;
  var HSFileUpload2;
  var HSRangeSlider2;
  var HSDatepicker2;
  if (typeof window !== "undefined") {
    try {
      if (typeof DataTable !== "undefined" && typeof jQuery !== "undefined") {
        HSDataTable2 = (init_datatable(), __toCommonJS(datatable_exports)).default;
      }
    } catch (e2) {
      console.warn("HSDataTable: Required dependencies not found");
      HSDataTable2 = null;
    }
    try {
      if (typeof _ !== "undefined" && typeof Dropzone !== "undefined") {
        HSFileUpload2 = (init_file_upload(), __toCommonJS(file_upload_exports)).default;
      }
    } catch (e2) {
      console.warn("HSFileUpload: Required dependencies not found");
      HSFileUpload2 = null;
    }
    try {
      if (typeof noUiSlider !== "undefined") {
        HSRangeSlider2 = (init_range_slider(), __toCommonJS(range_slider_exports)).default;
      }
    } catch (e2) {
      console.warn("HSRangeSlider: Required dependencies not found");
      HSRangeSlider2 = null;
    }
    try {
      if (typeof VanillaCalendarPro !== "undefined") {
        HSDatepicker2 = (init_datepicker(), __toCommonJS(datepicker_exports)).default;
      }
    } catch (e2) {
      console.warn("HSDatepicker: Required dependencies not found");
      HSDatepicker2 = null;
    }
  }
  var COLLECTIONS = [
    {
      key: "copy-markup",
      fn: copy_markup_default,
      collection: "$hsCopyMarkupCollection"
    },
    { key: "accordion", fn: accordion_default, collection: "$hsAccordionCollection" },
    { key: "carousel", fn: carousel_default, collection: "$hsCarouselCollection" },
    { key: "collapse", fn: collapse_default, collection: "$hsCollapseCollection" },
    { key: "combobox", fn: combobox_default, collection: "$hsComboBoxCollection" },
    ...HSDataTable2 ? [{
      key: "datatable",
      fn: HSDataTable2,
      collection: "$hsDataTableCollection"
    }] : [],
    ...HSDatepicker2 ? [{
      key: "datepicker",
      fn: HSDatepicker2,
      collection: "$hsDatepickerCollection"
    }] : [],
    { key: "dropdown", fn: dropdown_default, collection: "$hsDropdownCollection" },
    ...HSFileUpload2 ? [{
      key: "file-upload",
      fn: HSFileUpload2,
      collection: "$hsFileUploadCollection"
    }] : [],
    {
      key: "input-number",
      fn: input_number_default,
      collection: "$hsInputNumberCollection"
    },
    {
      key: "layout-splitter",
      fn: layout_splitter_default,
      collection: "$hsLayoutSplitterCollection"
    },
    { key: "overlay", fn: overlay_default, collection: "$hsOverlayCollection" },
    { key: "pin-input", fn: pin_input_default, collection: "$hsPinInputCollection" },
    ...HSRangeSlider2 ? [{
      key: "range-slider",
      fn: HSRangeSlider2,
      collection: "$hsRangeSliderCollection"
    }] : [],
    {
      key: "remove-element",
      fn: remove_element_default,
      collection: "$hsRemoveElementCollection"
    },
    { key: "scroll-nav", fn: scroll_nav_default, collection: "$hsScrollNavCollection" },
    { key: "scrollspy", fn: scrollspy_default, collection: "$hsScrollspyCollection" },
    { key: "select", fn: select_default, collection: "$hsSelectCollection" },
    { key: "stepper", fn: stepper_default, collection: "$hsStepperCollection" },
    {
      key: "strong-password",
      fn: strong_password_default,
      collection: "$hsStrongPasswordCollection"
    },
    { key: "tabs", fn: tabs_default, collection: "$hsTabsCollection" },
    {
      key: "textarea-auto-height",
      fn: textarea_auto_height_default,
      collection: "$hsTextareaAutoHeightCollection"
    },
    {
      key: "theme-switch",
      fn: theme_switch_default,
      collection: "$hsThemeSwitchCollection"
    },
    {
      key: "toggle-count",
      fn: toggle_count_default,
      collection: "$hsToggleCountCollection"
    },
    {
      key: "toggle-password",
      fn: toggle_password_default,
      collection: "$hsTogglePasswordCollection"
    },
    { key: "tooltip", fn: tooltip_default, collection: "$hsTooltipCollection" },
    { key: "tree-view", fn: tree_view_default, collection: "$hsTreeViewCollection" }
  ];

  // node_modules/preline/src/static/index.ts
  var HSStaticMethods = {
    getClassProperty,
    afterTransition,
    autoInit(collection = "all") {
      if (collection === "all") {
        COLLECTIONS.forEach(({ fn }) => {
          fn?.autoInit();
        });
      } else {
        COLLECTIONS.forEach(({ key, fn }) => {
          if (collection.includes(key)) fn?.autoInit();
        });
      }
    },
    cleanCollection(name = "all") {
      if (name === "all") {
        COLLECTIONS.forEach(({ collection }) => {
          if (window[collection] instanceof Array) {
            window[collection] = [];
          }
        });
      } else {
        COLLECTIONS.forEach(({ key, collection }) => {
          if (name.includes(key) && window[collection] instanceof Array) {
            window[collection] = [];
          }
        });
      }
    }
  };
  if (typeof window !== "undefined") {
    window.HSStaticMethods = HSStaticMethods;
  }

  // node_modules/preline/src/index.ts
  if (typeof window !== "undefined") {
    window.HSAccessibilityObserver = new accessibility_manager_default();
  }
  var HSDataTableModule;
  var HSFileUploadModule;
  var HSRangeSliderModule;
  var HSDatepickerModule = null;
  if (typeof window !== "undefined") {
    try {
      if (typeof DataTable !== "undefined" && typeof jQuery !== "undefined") {
        HSDataTableModule = (init_datatable(), __toCommonJS(datatable_exports)).default;
      }
    } catch (e2) {
      console.warn("HSDataTable: Required dependencies not found");
      HSDataTableModule = null;
    }
    try {
      if (typeof _ !== "undefined" && typeof Dropzone !== "undefined") {
        HSFileUploadModule = (init_file_upload(), __toCommonJS(file_upload_exports)).default;
      }
    } catch (e2) {
      console.warn("HSFileUpload: Required dependencies not found");
      HSFileUploadModule = null;
    }
    try {
      if (typeof noUiSlider !== "undefined") {
        HSRangeSliderModule = (init_range_slider(), __toCommonJS(range_slider_exports)).default;
      }
    } catch (e2) {
      console.warn("HSRangeSlider: Required dependencies not found");
      HSRangeSliderModule = null;
    }
    try {
      if (typeof VanillaCalendarPro !== "undefined") {
        HSDatepickerModule = (init_datepicker(), __toCommonJS(datepicker_exports)).default;
      }
    } catch (e2) {
      console.warn("HSDatepicker: Required dependencies not found");
      HSDatepickerModule = null;
    }
  }
})();
/*! Bundled license information:

preline/src/utils/index.ts:
preline/src/spa/index.ts:
preline/src/index.ts:
  (*
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/base-plugin/index.ts:
  (*
   * HSBasePlugin
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/select/index.ts:
  (*
   * HSSelect
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/datatable/index.ts:
  (*
   * HSDataTable
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/file-upload/index.ts:
  (*
   * HSFileUpload
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/range-slider/index.ts:
  (*
   * HSRangeSlider
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

vanilla-calendar-pro/index.mjs:
  (*! name: vanilla-calendar-pro v3.0.5 | url: https://github.com/uvarov-frontend/vanilla-calendar-pro *)

preline/src/plugins/datepicker/index.ts:
  (*
   * HSDatepicker
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/copy-markup/index.ts:
  (*
   * HSCopyMarkup
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/accordion/index.ts:
  (*
   * HSAccordion
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/carousel/index.ts:
  (*
   * HSCarousel
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/collapse/index.ts:
  (*
   * HSCollapse
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/combobox/index.ts:
  (*
   * HSComboBox
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/dropdown/index.ts:
  (*
   * HSDropdown
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/input-number/index.ts:
  (*
   * HSInputNumber
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/layout-splitter/index.ts:
  (*
   * HSLayoutSplitter
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/overlay/index.ts:
  (*
   * HSOverlay
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/pin-input/index.ts:
  (*
   * HSPinInput
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/remove-element/index.ts:
  (*
   * HSRemoveElement
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/scroll-nav/index.ts:
  (*
   * HSScrollNav
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/scrollspy/index.ts:
  (*
   * HSScrollspy
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/stepper/index.ts:
  (*
   * HSStepper
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/strong-password/index.ts:
  (*
   * HSStrongPassword
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/tabs/index.ts:
  (*
   * HSTabs
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/textarea-auto-height/index.ts:
  (*
   * HSTextareaAutoHeight
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/theme-switch/index.ts:
  (*
   * HSThemeSwitch
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/toggle-count/index.ts:
  (*
   * HSToggleCount
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/toggle-password/index.ts:
  (*
   * HSTogglePassword
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/tooltip/index.ts:
  (*
   * HSTooltip
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/plugins/tree-view/index.ts:
  (*
   * HSTreeView
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)

preline/src/static/index.ts:
  (*
   * HSStaticMethods
   * @version: 3.2.3
   * @author: Preline Labs Ltd.
   * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
   * Copyright 2024 Preline Labs Ltd.
   *)
*/
