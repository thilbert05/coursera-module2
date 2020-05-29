//function to correct the navbar collapse hide on blur
$(function (){ //$(function()...) is the same as document.addEventListener("DOMContentLoaded")...

    //Same as document.querySelector("#navbarToggle").addEventListener("blur", function (event){...})
    $("#navbarToggle").blur(function (event){
        var screenwidth = window.innerWidth; //navigator width
        if (screenwidth < 992){
           $("#collapsable-nav").collapse('hide');
        }
    });

    } 
);

(function (global){
    var dc = {};

    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl = "http://davids-restaurant.herokuapp.com/categories.json";
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var menuItemsURL = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-item.html";
    

    //convenience method to insert the html on a selector
    var insertHTML = function (selector,html){
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };
    //show loading icon inside element identified by 'selector'
    var showLoading = function (selector){
        var html = "<div class= 'text-center'>";
        html += "<img src='images/ajax-loading.gif'></div>"
        insertHTML(selector,html);
    };

    //Return substitute of '{{propname}}'
    //with propValue in given 'string'
    var insertProperty = function (string,propName,propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"),propValue);
        return string;
    };

    document.addEventListener("DOMContentLoaded", function (event){
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(homeHtml, function (respondText){
            var html = respondText;
            insertHTML("#main-content", html);
        },false); //don't want as JSON
    });

    dc.loadMenuCategories = function (){
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(allCategoriesUrl,buildAndShowCategoriesHTML);
    };

    //Load menu items view
    //'categoryShort' is a short_name for a category
    dc.loadMenuItems = function (categoryShort){
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(menuItemsURL+categoryShort,buildAndShowMenuItemsHTML);
    }

    //Builds HTML for the categories page based on the data
    //from the server
    function buildAndShowCategoriesHTML(categories){
        //Load title snippet of categories page
        $ajaxUtils.sendGetRequest(categoriesTitleHtml,function (categoriesTitleHtml){
            //Retrieve a single category snippet
            $ajaxUtils.sendGetRequest(categoryHtml, function (categoryHtml){
                var categoriesViewHtml = buildCategoriesViewHtml(categories,categoriesTitleHtml,categoryHtml);
                insertHTML("#main-content", categoriesViewHtml);
            },false);
        },false);
    }

    //Builds HTML for the single category page based on the data
    //from the server
    function buildAndShowMenuItemsHTML (categoryMenuItems){
        //Load title snippet of meny items page
        $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (menuItemsTitleHtml){
            //retrieve single menu item snippet
            $ajaxUtils.sendGetRequest(menuItemHtml,function (menuItemHtml){
                var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml,menuItemHtml);
                insertHTML("#main-content",menuItemHtml);
            },false);
        },false);
    }


    //Using categories data and snippets html
    //build categories view HTML to be inserted into page
    function buildCategoriesViewHtml (categories,categoriesTitleHtml,categoryHtml){
        var finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";

        //Loop overcategories 
        for (var i = 0; i < categories.length; i++) {
            //insert category values
            var html = categoryHtml;
            var name = "" + categories[i].name;
            var short_name = categories[i].short_name;
            html = insertProperty(html, "name", name);
            html = insertProperty(html,"short_name", short_name);
            finalHtml += html; 
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    //Build Items data and snippets html
    //build Items view HTML to be inserted into page
    function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml,menuItemHtml){
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,"special_instructions",categoryMenuItems.category.special_instructions);

        var finalHtml = menuItemsTitleHtml;
        finalHtml += "<section class='row'>";

        //loop over menu items
        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;
        for (var i = 0; i < menuItems.length; i++) {
            //insert menu items value
            var html = menuItemHtml;
            html = insertProperty(html,"short_name", menuItems[i].short_name);

            html = insertProperty(html,"catShortName",catShortName)
            ;

            html = insertItemPrice(html,"price_small",menuItems[i].price_small);

            html = insertItemPortionName(html,"small_portion_name",menuItems[i].small_portion_name);

            html = insertItemPrice(html,"price_large", menuItems[i].price_large);

            html = insertItemPortionName(html,"large_portion_name",menuItems[i].large_portion_name);

            html = insertProperty(html, "name", menuItems[i].name);
            
            html = insertProperty(html,"description", menuItems[i].description);

            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml;
    }

    // Appends price with '$' if price exists
    function insertItemPrice(html,
        pricePropName,
        priceValue) {
    // If not specified, replace with empty string
    if (!priceValue) {
    return insertProperty(html, pricePropName, "");;
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
    }


    // Appends portion name in parens if it exists
    function insertItemPortionName(html,
            portionPropName,
            portionValue) {
    // If not specified, return original string
    if (!portionValue) {
    return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
    }

    global.$dc = dc;

})(window);