$(document).ready(function() {
    // Set the "All circles" and "Dinner" options as the selected options
    $("#locationBoardPeopleSelect option:first").attr("selected", "selected");
    $("#locationBoardInklingSelect option:first").attr("selected", "selected");

    /* Updates my inklings with the logged in user's inklings for the inputted date */
    function updateMyInklings(date)
    {
        $.ajax({
            type: "POST",
            url: "/getMyInklings/",
            data: {"date" : date},
            success: function(html) {
                $("#homeContent").fadeOut("medium", function() {
                    $("#homeContent").html(html); 
    
                    // Set the value of the my inkling inputs
                    $("#dinnerInkling input").val($("#dinnerInkling input").attr("location"));
                    $("#pregameInkling input").val($("#pregameInkling input").attr("location"));
                    $("#mainEventInkling input").val($("#mainEventInkling input").attr("location"));

                    $("#homeContent").fadeIn("medium"); 
                });
            },
            error: function(a, b, error) { alert("home.js (1): " + error); }
        });
    }
    
    /* Updates others' inklings with the others' inklings for the inputted date */
    function updateOthersInklings(date)
    {
        if ($("#locationBoard").is(":visible"))
        {
            // Get the selected people type and ID
            var selectedPeopleOption = $("#locationBoardPeopleSelect option:selected");
            if (selectedPeopleOption.attr("people"))
            {
                var peopleType = "other";
                var peopleID = "circles";
            }
            else if (selectedPeopleOption.attr("sphereID"))
            {
                var peopleType = "sphere";
                var peopleID = selectedPeopleOption.attr("sphereID");
            }
            else if (selectedPeopleOption.attr("circleID"))
            {
                var peopleType = "circle";
                var peopleID = selectedPeopleOption.attr("circleID");
            }

            // Get the selected inkling type
            var inklingType = $("#locationBoardInklingSelect option:selected").attr("inklingType");

            var includeMember = "false";
        }
        else
        {
            var peopleType = "other";
            var peopleID = "circles";
            var inklingType = "dinner";
            var includeMember = "true";
        }

        // Update others' inklings
        $.ajax({
            type: "POST",
            url: "/getOthersInklings/",
            data: { "peopleType" : peopleType, "peopleID" : peopleID, "inklingType" : inklingType, "includeMember" : includeMember, "date" : date },
            success: function(html) {
                if (includeMember == "true")
                {
                    $("#homeContent").fadeOut("medium", function() {
                        $("#homeContent").html(html);
                        $("#homeContent").fadeIn("medium");
                    });
                }
                else
                {
                    $("#locationBoard").fadeOut("medium", function() {
                        $("#locationBoard").html(html);
                        $("#locationBoard").fadeIn("medium");
                    });
                }
            },
            error: function(a, b, error) { alert("home.js (5): " + error); }
        });
    }
    
    $("#inklingsContentLinks p").click(function() {
        // Only update the content if the content link that is clicked is not the currently selected content link
        if (!$(this).hasClass("selectedContentLink"))
        {
            // Make the clicked link the selected one
            $("#inklingsContentLinks .selectedContentLink").removeClass("selectedContentLink");
            $(this).addClass("selectedContentLink");
        
            // Get the selected date
            var date = $(".selectedDateContainer").attr("month") + "/" + $(".selectedDateContainer").attr("day") + "/" + $(".selectedDateContainer").attr("year");

            // Update and show others' inklings if my inklings is visible
            var contentType = $(this).attr("contentType");
            if (contentType == "myInklings")
            {
                updateMyInklings(date);
            }

            // Othwerise, if others' inklings is visible, update and show my inklings
            else if (contentType == "othersInklings")
            {
                updateOthersInklings(date);
            }
        }
    });

    /* Updates others' inklings when a location board select is changed */
    $(".locationBoardSelect").live("change", function () {
        // Get the selected date
        var date = $(".selectedDateContainer").attr("month") + "/" + $(".selectedDateContainer").attr("day") + "/" + $(".selectedDateContainer").attr("year");
        
        // Update others' inklings for the selected date
        updateOthersInklings(date);
    });
   
    /* Remove the inkling when it's input is empty and it loses focus */
    $(".inkling input").live("blur", function() {
        // If the value of the of the inkling input is not empty, remove the inkling
        var query = $(this).val();
        if (query == "")
        {
            // Get the type of the selected inkling
            var inklingElement = $(this).parents(".inkling");
            var inklingType = inklingElement.attr("inklingType");

            // Get the selected date
            var date = $(".selectedDateContainer").attr("month") + "/" + $(".selectedDateContainer").attr("day") + "/" + $(".selectedDateContainer").attr("year");

            // Remove the inkling (and its corresponding image)
            $.ajax({
                type: "POST",
                url: "/removeInkling/",
                data: {"inklingType" : inklingType, "date" : date},
                success: function() {
                    inklingElement.find("img").attr("src", "/static/media/images/locations/default.jpg");
                },
                error: function(a, b, error) { alert("home.js (3): " + error); }
            });
        }

        // Otherwise, simply fade out the inkling suggestions
        else
        {
            var inklingElement = $(this).parents(".inkling");
            inklingElement.find(".inklingSuggestions").fadeOut("medium");
        }
    });

    /* Updates the inkling when an inkling suggestion is clicked */
    $("#homeContent .suggestion").live("click", function() {
        // Get the ID of the selected location
        var locationID = $(this).attr("suggestionID");

        // Get the type of the selected inkling
        var inklingElement = $(this).parents(".inkling");
        var inklingType = inklingElement.attr("inklingType");

        // Get the selected date
        var date = $(".selectedDateContainer").attr("month") + "/" + $(".selectedDateContainer").attr("day") + "/" + $(".selectedDateContainer").attr("year");

        // Create the selected inkling and update its corresponding content
        $.ajax({
            type: "POST",
            url: "/createInkling/",
            data: {"inklingType" : inklingType, "locationID" : locationID, "date" : date},
            success: function(locationInfo) {
                // Split the location name and image
                locationInfo = locationInfo.split("&&&");
                locationName = locationInfo[0];
                locationImage = "/static/media/images/locations/" + locationInfo[1];
                
                // Update the value of the inkling's input
                inklingElement.find("input").val(locationInfo[0]);

                // Update the inkling's image (only if the location has changed)
                var inklingImage = inklingElement.find("img");
                if (locationImage != inklingImage.attr("src"))
                {
                    inklingImage.fadeOut("medium", function() {
                        inklingImage.attr("src", locationImage);
                        inklingImage.fadeIn("medium");
                    });
                }
                
                // Fade out the inkling's suggestions
                inklingElement.find(".inklingSuggestions").fadeOut("medium");
            },
            error: function(a, b, error) { alert("home.js (4): " + error); }
        });
    });

    $(".inklingSuggestions .suggestion").live("hover", function() {
        // If there is a selected item, remove it
        if ($(".selectedSuggestion").length != 0)
        {
            $(".selectedSuggestion").removeClass("selectedSuggestion");
        }

        // Set the suggestion which was hovered over as selected
        $(this).addClass("selectedSuggestion");
    });

    $(".inkling input").live("keyup", function(e) {
        // Store the suggestions element
        var suggestionsElement = $(this).parent().next();

        // Get the current search query and strip its whitespace
        var query = $(this).val().replace(/^\s+|\s+$/g, "");

        // Make sure the search query is not empty
        if (query != "")
        {
            // If the "Enter" button is pressed, redirect to the search page or trigger the selected item's click event
            if ((e.keyCode == 10) || (e.keyCode == 13))
            {
                // Otherwise, trigger the selected item's click event
                if ($(".selectedSuggestion").length != 0)
                {
                    $(".selectedSuggestion").trigger("click");
                }
            }

            // If the up arrow key is pressed, scroll through the suggestions
            else if (e.keyCode == 38)
            {
                // If there is no selected suggestion, set the last suggestion as selected
                if ($(".selectedSuggestion").length == 0)
                {
                    $(".suggestion:last").addClass("selectedSuggestion");
                }

                // Otherwise, set the previous suggestion as selected
                else
                {
                    var selectedSuggestionElement = $(".selectedSuggestion");
                    var nextSuggestionElement = selectedSuggestionElement.prev();
                    selectedSuggestionElement.removeClass("selectedSuggestion");
                    nextSuggestionElement.addClass("selectedSuggestion");
                }
            }
       
            // If the down arrow key is pressed, scroll through the suggestions
            else if (e.keyCode == 40)
            {
                // If there is no selected suggestion, set the first suggestion as selected
                if ($(".selectedSuggestion").length == 0)
                {
                    $(".suggestion:first").addClass("selectedSuggestion");
                }

                // Otherwise, set the next suggestion as selected
                else
                {
                    var selectedSuggestionElement = $(".selectedSuggestion");
                    var nextSuggestionElement = selectedSuggestionElement.next();
                    selectedSuggestionElement.removeClass("selectedSuggestion");
                    nextSuggestionElement.addClass("selectedSuggestion");
                }
            }

            // Otherwise, if the left or right arrow keys are not pressed, update the search suggestions
            else if ((e.keyCode != 37) && (e.keyCode != 39))
            {
                $.ajax({
                    type: "POST",
                    url: "/suggestions/",
                    data: {"type" : "inkling", "query" : query},
                    success: function(html) {
                        // Update the HTML of the suggestions element
                        suggestionsElement.html(html);

                        // Fade in the suggestions element
                        suggestionsElement.fadeIn("medium");
                    },
                    error: function(a, b, error) { alert("home.js (2): " + error); }
                });
            }
        }

        // If the search query is empty, fade out the inkling suggestions
        else
        {
            $(".inklingSuggestions").fadeOut("medium");
        }
    });
    
    // THE FUNCTIONS BELOW SHOULD BE MOVED TO CALENDAR.JS
    
    
       
});
