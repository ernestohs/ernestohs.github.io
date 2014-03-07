(function($){

  var dropdown;
  var dropdownIsIn;
  var input;
  var methods;
  var matched;
  var currentIndex;
  var currentElement;
  var keyword;
  var timer;
  var template;

  $(document).ready(function(){
    dropdown = $('#api_search_dropdown');
    input = $('#api_search_input');
    template = $.tmpl($('#api_search_template').html());
    methods = [];
    matched = [];
    populateDropdown();
    setupEvents();
    $(document).keydown(handleArrows);
    input.keyup(searchAPI).val('');
    input.focus(function(){
      clearTimeout(timer);
    });
    input.blur(function(){
      timer = setTimeout(function(){
        input.val('');
        hideDropdown();
      }, 200);
    });
    input.parent('form').submit(function(){
      return false;
    });
  });

  function setupEvents() {
    dropdown.on('click', '.method', function() {
      if(window.showMethod){
        var match = this.href.match(/api\/(.+?)\/(.+?)$/);
        showMethod(match[1], match[2]);
        input.blur();
      } else {
        window.location = this.href;
      }
    });
  }

  function populateDropdown(){
    Object.each(SugarPackages, function(packageName, package) {
      Object.each(package.modules, function(moduleName, module) {
        Object.each(module, function(methodName, method) {
          // Make this better
          method.module = moduleName;
          method.class_method = method.class_method || false;
          method.name = methodName;
          method.set = method.set || [];
          if(method.set.length > 0) {
            method.set.forEach(function(name) {
              var m = Object.clone(method);
              m.name = name.replace(/\w+\./, '');
              if(!name.match(/\./)) {
                // Not including namespaced methods here
                addMethod(m, moduleName);
              }
            });
          } else {
            addMethod(method, moduleName);
          }
        });
      });
    });
    methods.sort(function(a, b) {
      if(a.module === b.module && a.class_method === b.class_method) {
        return a.name < b.name ? -1 : 1;
      } else if(a.module === b.module) {
        return a.class_method ? -1 : 1;
      } else {
        return a.module < b.module ? -1 : 1;
      }
    });
    methods.forEach(function(method) {
      method.dropdown_element = $(template(method)).appendTo(dropdown);
    });
  }

  function addMethod(method, moduleName) {
    method.normalized = (moduleName + method.name).toLowerCase();
    methods.push(method);
  }

  function handleArrows(event){
    if(!dropdownIsIn){
      if((event.which == 38 || event.which == 40) && input.val().length > 1){
        showDropdown();
        return false;
      }
      return;
    };
    if(event.which == 38){
      stepThroughMethods(-1);
      return false;
    } else if(event.which == 40){
      stepThroughMethods(1);
      return false;
    } else if(event.which == 27){
      hideDropdown();
      return false;
    } else if(event.which == 13){
      if(currentElement) currentElement.click();
      return false;
    }
  }

  function searchAPI(event){
    var str = input.val().toLowerCase();
    if(str == keyword) return;
    matched = [];
    keyword = str;
    if(keyword.length > 1){
      currentIndex = null;
      methods.each(function(m){
        if(m.normalized.search(keyword) === -1){
          m.dropdown_element.hide();
        } else {
          matched.push(m);
          m.dropdown_element.show();
        }
      });
    }
    if(matched.length > 0){
      showDropdown();
    } else {
      hideDropdown();
    }
  }

  function showDropdown(){
    dropdown.stop(true, true).fadeIn(100);
    dropdownIsIn = true;
  }

  function hideDropdown(){
    dropdown.stop(true, true).fadeOut(100);
    dropdownIsIn = false;
  }

  function stepThroughMethods(step){
    if(currentIndex == null){
      currentIndex = 0;
    } else {
      currentIndex += step;
    }
    if(currentElement) currentElement.removeClass('focused');
    currentElement = matched.at(currentIndex).dropdown_element;
    currentElement.addClass('focused');
  }

})(jQuery);
