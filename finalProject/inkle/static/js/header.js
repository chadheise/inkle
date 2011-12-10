$(document).ready(function() {
    $("#searchInput").val("Search");
    
    $("#searchInput").focus(function() {
        if ($(this).val() == "Search")
        {
            $(this).val("");
            $(this).css("color", "#000");
        }
    });
    
    $("#searchInput").blur(function() {
        if ($(this).val() == "")
        {
            $(this).val("Search");
            $(this).css("color", "#888");
        }
    });

    $("#searchInput").keydown(function(e) {
        if ((e.keyCode == 10) || (e.keyCode == 13))
        {
            var query = $("#searchInput").val();

            if (query != "")
            {
                window.location.href = "/inkle/search/" + query;
            }
        }
    });
    
    $("#searchInput").keyup(function(e) {
        var query = $("#searchInput").val();

        if (query != "")
        {
            $.ajax({
                type: "POST",
                url: "/inkle/suggestions/",
                data: {"type" : "search", "query" : query},
                success: function(html) {
                    $("#searchSuggestions").html(html);
                    $("#searchSuggestions").fadeIn("medium");
                },
                error: function(a, b, error) { alert(error); }
            });
        }
        else
        {
            $("#searchSuggestions").fadeOut("medium");
        }
    });
});
