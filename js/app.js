
$(function(){
    // Algolia.
    var algoliaAppId = '8VFX1FKCC2';
    var algoliaAppKey = '74dd2262bb8fc81f6b4a224682fdb3b2';
    var algoliaIndexId = 'app_store';

    var client = $.algolia.Client(algoliaAppId, algoliaAppKey);
    var index = client.initIndex(algoliaIndexId);

    // Mustache.
    var itemTemplate = $('#item-template').html();
    Mustache.parse(itemTemplate);

    var categoryTemplate = $('#category-template').html();
    Mustache.parse(categoryTemplate);

    var categories = $('ul#categories');

    var results = $('ul#items');
    var noResults = $('#no-results');
    noResults.hide();

    // --------------------------
    // Searching.
    // --------------------------
    var currentPage = 0;
    var nbPages = 1;
    var facetFilters = [];

    var searchInput = $("#search-input");

    // Nice instant focus on initial page load.
    searchInput.focus();

    // Listen for search changes.
    searchInput.on('keyup', refreshResults);

    function refreshResults() {
        if(searchInput.val() == '') {
            hideClear();
        } else {
            showClear();
        }

        loadPage(0);
    }

    function itemsToHtml(items) {
        var html = '';
        for (itemIndex in items) {
            var i = items[itemIndex];
            i.name = i._highlightResult.name.value;
            html += Mustache.render(itemTemplate, i);
        }
        return html;
    }

    function replaceResultsWithNewOnes(items) {
        results.html(itemsToHtml(items));
    }

    function appendNewResults(items) {
        results.append(itemsToHtml(items));
    }

    function loadPage(page) {
        index.search(searchInput.val(),
            {
                hitsPerPage: 30,
                page: page,
                facets: '*',
                facetFilters: facetFilters
            },
            function searchDone(err, content) {
                // todo: eventually deal with errors here.
                console.log(content);
                currentPage = content.page;
                nbPages = content.nbPages;

                refreshFacets(content.facets);

                // If nbPages == 0, it means that there are no results.
                if(nbPages==0) {
                    noResults.show();
                } else {
                    noResults.hide();
                }

                // Are we actually on the last page?
                if(currentPage+1>=nbPages) {
                    loader.hide();
                } else {
                    loader.show();
                }

                // If on the first page, replace the results, otherwise append them.
                if(currentPage == 0) {
                    replaceResultsWithNewOnes(content.hits)
                } else {
                    appendNewResults(content.hits);
                }
            }
        );
    }

    // --------------------------
    // Facets.
    // --------------------------
    function refreshFacets(facets)
    {
        var html = '';
        if('category' in facets) {
            var items = facets.category;
            for (category in items) {
                var itemClass = 'inactive';
                if (facetFilters.length > 0) {
                    itemClass = 'active';
                }
                html += Mustache.render(categoryTemplate, {
                    name: category,
                    count: items[category],
                    itemClass: itemClass
                });
            }
        }

        categories.html(html);
    }

    function enableCategory(category)
    {
        facetFilters = ['category:' + category];
        refreshResults();
    }

    function disableCategories()
    {
        facetFilters = [];
        refreshResults();
    }

    categories.on('click', 'a', function(e) {
        e.preventDefault();
        var $this = $(e.currentTarget);
        if($this.hasClass('active')) {
            disableCategories();
        } else {
            var category = $this.find('.category-name').html();
            enableCategory(category);
        }
    });

    // --------------------------
    // Lazy loading.
    // --------------------------
    var loader = $('.loader');
    loader.appear();
    $(document.body).on('appear', '.loader', function(e, $affected) {
        loadPage(currentPage+1);
    });

    // --------------------------
    // Search clearing.
    // --------------------------
    var clean = $(".clean");
    clean.on('click', function(e) {
        e.preventDefault();
        clearSearch();
    });

    function clearSearch()
    {
        searchInput.val('');
        refreshResults();
    }

    function hideClear()
    {
        clean.hide();
    }

    function showClear()
    {
        clean.show();
    }

    // Initial results.
    refreshResults();

    // --------------------------
    // Animations & Interactions.
    // --------------------------
    $('ul#items').on('mouseenter', 'li.item', function(e) {
        $(e.currentTarget).addClass('over');
    });

    $('ul#items').on('mouseleave', 'li.item', function(e) {
        $(e.currentTarget).removeClass('over');
    });

    $('ul#items').on('click', 'li.item', function(e) {
        var link = $(e.currentTarget).data('link');
        window.open(link, '_blank');
    });

    // --------------------------
    // Smooth scrolling to search input & Focus.
    // --------------------------
    $('a#top').on('click', function (e) {
        e.preventDefault();
        $('html,body').animate({scrollTop: 0}, 500);
        searchInput.focus();
    });
});