/* Copyright 2012 Chad Heise & Jacob Wenger - All Rights Reserved */

$(document).ready(function() {
    // Set the "All blots" and "Dinner" options as the selected options
    $("#locationBoardPeopleSelect option:first").attr("selected", "selected");

    /* Returns the currently selected date */
    function getSelectedDate(delimiter)
    {
        return date = $("#calendar").attr("selectedMonth") + delimiter + $("#calendar").attr("selectedDay") + delimiter + $("#calendar").attr("selectedYear");
    }

    /* Updates my inklings with the logged in user's inklings for the inputted date */
    function updateMyInklings(date)
    {
        if ($("#myInklings").is(":visible"))
        {
            var includeCalendar = "false";
        }
        else
        {
            var includeCalendar = "true";
        }

        $.ajax({
            type: "POST",
            url: "/getMyInklings/",
            data: { "date" : date, "includeCalendar" : includeCalendar },
            success: function(html) {
                if ($("#myInklings").is(":visible"))
                {
                    $("#myInklings").fadeOut("medium", function() {
                        $("#myInklings").html(html); 
    
                        // Set the value of the my inkling inputs
                        $("#dinnerInkling input").val($("#dinnerInkling input").attr("location"));
                        $("#pregameInkling input").val($("#pregameInkling input").attr("location"));
                        $("#mainEventInkling input").val($("#mainEventInkling input").attr("location"));
    
                        $("#myInklings").fadeIn("medium"); 
                    });
                }
                else
                {
                    $("#homeContent").fadeOut("medium", function() {
                        $("#homeContent").html(html); 
    
                        // Set the value of the my inkling inputs
                        $("#dinnerInkling input").val($("#dinnerInkling input").attr("location"));
                        $("#pregameInkling input").val($("#pregameInkling input").attr("location"));
                        $("#mainEventInkling input").val($("#mainEventInkling input").attr("location"));
    
                        $("#homeContent").fadeIn("medium"); 
                    });
                }
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("home.js (1): " + error);
                }
            }
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
                var peopleID = "blots";
            }
            else if (selectedPeopleOption.attr("networkID"))
            {
                var peopleType = "network";
                var peopleID = selectedPeopleOption.attr("networkID");
            }
            else if (selectedPeopleOption.attr("blotID"))
            {
                var peopleType = "blot";
                var peopleID = selectedPeopleOption.attr("blotID");
            }

            var inklingType = $("#othersInklingsContentLinks .selectedSubsectionContentLink").attr("contentType");

            var includeMember = "false";
        }
        else
        {
            var peopleType = "other";
            var peopleID = "blots";
            var inklingType = "all";
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
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("home.js (2): " + error);
                }
            }
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
            var date = getSelectedDate("/");

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

    /* Updates which inklings are displayed when an other's inklings content link is clicked */
    $("#othersInklingsContentLinks p").live("click", function() {
        // Only update the content if the subsection content link which is clicked is not the currently selected one
        if (!$(this).hasClass("selectedSubsectionContentLink"))
        {
            // Update the selected subsection content link
            $(this).siblings().removeClass("selectedSubsectionContentLink");
            $(this).addClass("selectedSubsectionContentLink");

            // Get the selected date
            var date = getSelectedDate("/");

            updateOthersInklings(date);
        }
    });

    /* Updates which inklings are displayed when a member place content link is clicked */
    $("#memberPlaceContentLinks p").live("click", function() {
        // Only update the content if the subsection content link which is clicked is not the currently selected one
        if (!$(this).hasClass("selectedSubsectionContentLink"))
        {
            // Update the selected subsection content link
            $(this).siblings().removeClass("selectedSubsectionContentLink");
            $(this).addClass("selectedSubsectionContentLink");

            // Load the content for the clicked subsection inkling type
            if ( $(this).attr("contentType") == "all" ) {
                $(".subsectionTitle").fadeIn("medium");
                $(".inklingContent").fadeIn("medium");
            }
            else if ( $(this).attr("contentType") == "dinner" ) {
                $(".subsectionTitle").fadeOut("medium");
                $(".inklingContent").fadeOut("medium") ;
                $("#dinnerContent").delay(400).fadeIn("medium");
            }
            else if ( $(this).attr("contentType") == "pregame" ) {
                $(".subsectionTitle").fadeOut("medium");
                $(".inklingContent").fadeOut("medium");
                $("#pregameContent").delay(400).fadeIn("medium");
            }
            else if ( $(this).attr("contentType") == "mainEvent" ) {
                $(".subsectionTitle").fadeOut("medium");
                $(".inklingContent").fadeOut("medium");
                $("#mainEventContent").delay(400).fadeIn("medium");
            }
        }
    });

    /* Updates others' inklings when a location board select is changed */
    $(".locationBoardSelect").live("change", function () {
        // Get the selected date
        var date = getSelectedDate("/");
        
        // Update others' inklings for the selected date
        updateOthersInklings(date);
    });
   
    /* Remove the inkling when it's input is empty and it loses focus */
    $(".inkling input").live("blur", function() {
        // If the value of the of the inkling input is not empty, remove the inkling
        var thisElement = $(this);
        var query = $(this).val();
        var inklingLocation = $(this).attr("location");
        if ((query == "") && (inklingLocation != ""))
        {
            // Get the type of the selected inkling
            var inklingElement = $(this).parents(".inkling");
            var inklingType = inklingElement.attr("inklingType");

            // Get the selected date
            var date = getSelectedDate("/");

            // Remove the inkling (and its corresponding image)
            $.ajax({
                type: "POST",
                url: "/removeInkling/",
                data: {"inklingType" : inklingType, "date" : date},
                success: function() {
                    thisElement.attr("location", "");
                    
                    inklingElement.find("img").fadeOut("medium", function() {
                        $(this).attr("src", "/static/media/images/locations/default.jpg");
                        $(this).fadeIn("medium");
                    });

                    var inklingInviteContainer = $(".inklingInviteContainer[inklingType = '" + inklingElement.attr("inklingType") + "']");
                    inklingInviteContainer.attr("inklingID", "");
                    inklingInviteContainer.addClass("hidden");
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("home.js (3): " + error);
                    }
                }
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
    $(".inklingSuggestions .suggestion").live("click", function() {
        // Get the ID of the selected location
        var locationID = $(this).attr("suggestionID");

        // Get the location type (location or member place)
        var locationType = $(this).attr("suggestionType");

        // Get the type of the selected inkling
        var inklingElement = $(this).parents(".inkling");
        var inklingType = inklingElement.attr("inklingType");

        // Get the selected date
        var date = getSelectedDate("/");

        // Create the selected inkling and update its corresponding content
        $.ajax({
            type: "POST",
            url: "/createInkling/",
            data: {"inklingType" : inklingType, "locationID" : locationID, "locationType" : locationType, "date" : date},
            success: function(locationInfo) {
                // Split the location name and image
                var locationInfo = locationInfo.split("|<|>|");
                var locationName = locationInfo[0];
                var locationImage = "/static/media/images/" + locationType + "/" + locationInfo[1] + ".jpg";
                var inklingID = locationInfo[2];
                
                // Update the value of the inkling's input
                inklingElement.find("input").val(locationName);
                inklingElement.find("input").attr("location", locationName);

                // Update the inkling's image (only if the location has changed)
                var inklingImage = inklingElement.find("img");
                if (locationImage != inklingImage.attr("src"))
                {
                    inklingImage.fadeOut("medium", function() {
                        inklingImage.attr("src", locationImage);
                        inklingImage.fadeIn("medium");
                    });
                }
                
                var inklingInviteContainer = $(".inklingInviteContainer[inklingType = '" + inklingElement.attr("inklingType") + "']");
                inklingInviteContainer.attr("inklingID", inklingID);
                inklingInviteContainer.removeClass("hidden");

                // Fade out the inkling's suggestions
                inklingElement.find(".inklingSuggestions").fadeOut("medium");
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("home.js (4): " + error);
                }
            }
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
                    error: function(jqXHR, textStatus, error) {
                        if ($("body").attr("debug") == "True")
                        {
                            alert("home.js (5): " + error);
                        }
                    }
                });
            }
        }

        // If the search query is empty, fade out the inkling suggestions
        else
        {
            $(".inklingSuggestions").fadeOut("medium");
        }
    });
    
    /* Goes to a member place or location when a location board card is clicked */
    $(".locationBoardCard").live("click", function() {
        // Get the selected date and inkling type
        var date = getSelectedDate("_");
        var inklingType = $("#othersInklingsContentLinks .selectedSubsectionContentLink").attr("contentType");

        // If the the clicked location is a member place, go the that member's page
        if ( $(this).attr("type") == "memberPlace" )
        {
            window.location = $(this).attr("url") + "place/" + date + "/" + inklingType + "/";
        }

        // Otherwise, simply go to the location page
        else
        {
            window.location = $(this).attr("url") + inklingType + "/" + date + "/";
        }
    });

    $(".inklingInviteButton").live("click", function() {
        var invitedContainer = $(this).siblings(".invited");

        var invited = "";
        invitedContainer.find(".invitedPeople").each(function(index) {
            invited += $(this).attr("category") + "|<|>|";
            invited += $(this).attr("suggestionID") + "|<|>|";
        });

        var inklingID = $(this).parents(".inklingInviteContainer").attr("inklingID");

        // Update calendar
        $.ajax({
            type: "POST",
            url: "/inklingInvitations/",
            data: { "invited" : invited, "inklingID" : inklingID },
            success: function(html) {
                invitedContainer.empty();
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("home.js (6): " + error);
                }
            }
        });
    });

    $(".removeInvitedPeople").live("click", function() {
        $(this).parent().remove();
    });

    $(".inklingInviteContainer .selectedSuggestion").live("click", function() {
        $(".inklingInviteSuggestions").fadeOut("medium");
        var category = $(this).attr("category");
        var suggestionID = $(this).attr("suggestionID");
        var inklingInviteContainer = $(this).parents(".inklingInviteContainer");
        inklingInviteContainer.find("input").val("");
        inklingInviteContainer.find(".invited").append("<div class='invitedPeople' category='" + category + "' suggestionID='" + suggestionID + "'><p class='invitedPeopleName'>" + $(this).find("p").attr("fullName") + "</p><div class='removeInvitedPeople'><p>x</p></div></div>");
    });
    
    $(".inklingInviteSuggestions .suggestion").live("hover", function() {
        // If there is a selected item, remove it
        if ($(".selectedSuggestion").length != 0)
        {
            $(".selectedSuggestion").removeClass("selectedSuggestion");
        }

        // Set the suggestion which was hovered over as selected
        $(this).addClass("selectedSuggestion");
    });

    $(".inklingInviteContainer input").live("blur", function() {
        $(".inklingInviteSuggestions").fadeOut("medium");
    });

    $(".inklingInviteContainer input").live("keyup", function(e) {
        // Store the suggestions element
        var suggestionsElement = $(this).next().next();

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
                    var nextSuggestionElement = selectedSuggestionElement.prev(".suggestion");
                    selectedSuggestionElement.removeClass("selectedSuggestion");
                    nextSuggestionElement.addClass("selectedSuggestion");
                    if ($(".selectedSuggestion").length == 0)
                    {
                        var nextSuggestionElement = selectedSuggestionElement.prev().prev();
                        nextSuggestionElement.addClass("selectedSuggestion");
                    }
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
                    var nextSuggestionElement = selectedSuggestionElement.next(".suggestion");
                    selectedSuggestionElement.removeClass("selectedSuggestion");
                    nextSuggestionElement.addClass("selectedSuggestion");
                    if ($(".selectedSuggestion").length == 0)
                    {
                        var nextSuggestionElement = selectedSuggestionElement.next().next();
                        nextSuggestionElement.addClass("selectedSuggestion");
                    }
                }
            }

            // Otherwise, if the left or right arrow keys are not pressed, update the search suggestions
            else if ((e.keyCode != 37) && (e.keyCode != 39))
            {
                $.ajax({
                    type: "POST",
                    url: "/suggestions/",
                    data: {"type" : "inklingInvite", "query" : query},
                    success: function(html) {
                        // Update the HTML of the suggestions element
                        suggestionsElement.html(html);

                        // Fade in the suggestions element
                        suggestionsElement.fadeIn("medium");
                    },
                    error: function(jqXHR, textStatus, error) {
                        if ($("body").attr("debug") == "True")
                        {
                            alert("home.js (7): " + error);
                        }
                    }
                });
            }
        }

        // If the search query is empty, fade out the inkling suggestions
        else
        {
            $(".inklingInviteSuggestions").fadeOut("medium");
        }
    });
    
    // THE FUNCTIONS BELOW SHOULD BE MOVED TO CALENDAR.JS

    /* Updates either my inklings or others' inklings (depending on which is visible) when a date container is clicked */
    $(".dateContainer").live("click", function() {
        // Only update the content if the date container that is clicked is not the currently selected date container
        if (!$(this).hasClass("selectedDateContainer"))
        {
            // Change the selected date container
            $(".selectedDateContainer").removeClass("selectedDateContainer");
            $(this).addClass("selectedDateContainer");

            // Get the clicked date and update the calendar's selected date information
            var calendar = $("#calendar");
            calendar.attr("selectedMonth", $(this).attr("month"));
            calendar.attr("selectedDay", $(this).attr("day"));
            calendar.attr("selectedYear", $(this).attr("year"));
            calendar.attr("selectedDate", $(this).attr("date"));
            var date = getSelectedDate("/");

            // Update my inklings if it is visible
            var contentType = ($(".selectedContentLink").attr("contentType"))
            if (contentType == "myInklings")
            {
                updateMyInklings(date);
            }

            // Othwerise, if others' inklings is visible, update others inklings
            else if (contentType == "othersInklings")
            {
                updateOthersInklings(date);
            }
        }
    });

    /* Sets the selected date as today when the "Today" button is clicked */
    $(".todayButton").live("click", function() {
        // Get today's date
        var today = new Date();
        var calendar = $("#calendar");
        if ((today.getMonth() + 1 != calendar.attr("selectedMonth")) || (today.getDate() != calendar.attr("selectedDay")) || (today.getFullYear() != calendar.attr("selectedYear")))
        {
            // Get the number of calendar dates to display
            numDates = $(".dateContainer").size();

            // Update calendar
            $.ajax({
                type: "POST",
                url: "/dateSelect/",
                data: {"arrow" : "today", "numDates" : numDates},
                success: function(html) {            
                    // Update the HTML of the calendar
                    $("#calendarContainer").html(html);

                    // Get the selected date
                    var date = getSelectedDate("/");

                    // Update my inklings if it is visible
                    var contentType = ($(".selectedContentLink").attr("contentType"))
                    if (contentType == "myInklings")
                    {
                        updateMyInklings(date);
                    }

                    // Othwerise, if others' inklings is visible, update others inklings
                    else if (contentType == "othersInklings")
                    {
                        updateOthersInklings(date);
                    }                          
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("calendar.js (1): " + error);
                    }
                }
            });
        }
    });
});
