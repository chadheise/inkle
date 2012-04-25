/* Copyright 2012 Chad Heise & Jacob Wenger - All Rights Reserved */

$(document).ready(function() {

    /* If an inkling input gains focus and it says "Where are you going?" grayed out, make the text blue and empty it */
    $(".inkling input").live("focus", function() {
        if ($(this).hasClass("emptyInklingInput"))
        {
            $(this).val("").removeClass("emptyInklingInput");
            $(this).attr("location", "");
        }
    });
   
    /* Remove the inkling when it's input is empty and it loses focus */
    $(".inkling input").live("blur", function() {
        // If the value of the inkling input is not empty, remove the inkling
        var thisElement = $(this);
        var query = $(this).val();
        var inklingLocation = $(this).attr("location");

        if (query == "")
        {
            $(this).val("Where are you going?").addClass("emptyInklingInput");
        }

        if ((query == "") && (inklingLocation != ""))
        {
            // Get the type of the selected inkling
            var inklingElement = $(this).parents(".inkling");
            var inklingType = inklingElement.attr("inklingType");

            // Get the selected date
            var date = inklingElement.attr("inklingDate");;

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

                    var inviteButton = $(".inklingInviteButton[inklingType='" + inklingType + "']");
                    inviteButton.fadeOut("medium");

                    // Set attribute of invite container
                    $("#" + inklingType + "InklingInviteContainer").attr("inklingID", "");
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("setMyInklingMobile.js (3): " + error);
                    }
                }
            });
        }
        // Otherwise, simply fade out the inkling suggestions
        else
        {
            $("#inklingSuggestions").fadeOut("medium");
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
                
                // Fade in the invite button
                var inviteButton = $(".inklingInviteButton[inklingType='" + inklingType + "']");
                inviteButton.fadeIn("medium");

                // Set attribute of invite container
                $("#" + inklingType + "InklingInviteContainer").attr("inklingID", inklingID);

                // Fade out the inkling's suggestions
                $("#inklingSuggestions").fadeOut("medium", function() {
                    $(this).children().remove();
                });
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("home.js (4): " + error);
                }
            }
        });
    });

    $(".inkling input").live("keyup", function(e) {

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

            // Otherwise, if the left or right arrow keys are not pressed, update the search suggestions
            else if ((e.keyCode != 37) && (e.keyCode != 39))
            {
                $.ajax({
                    type: "POST",
                    url: "/mobile/suggestions/location/",
                    data: { "type" : "inkling", "query" : query },
                    success: function(html) {
                        // Update the HTML of the suggestions element
                        $("#inklingSuggestions").html(html);

                        // Fade in the suggestions element
                        $("#inklingSuggestions").fadeIn("medium");
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

    /* If the inkling invitation input gains focus and it is grayed out, make the text black and empty it */
    $(".inklingInviteContainer .emptyInput").live("focus", function() {
        $(this).val("").removeClass("emptyInput");
    });
   
    /* If the inkling invitation input loses focus and is empty, gray it out, put text in it, and fade out the inkling suggestions*/
    $(".inklingInviteContainer input").live("blur", function() {
        if ($(this).val() == "")
        {
            $(this).val("Invite people or blots").addClass("emptyInput");
        }
        
        $(".inklingInviteSuggestions").fadeOut("medium");
    });

    /* If the inkling invitation textarea loses focus and is empty, gray it out and put text in it */
    $(".inklingInviteContainer textarea").live("blur", function() {
        if ($(this).val() == "")
        {
            $(this).val("Send a message with this invitation").addClass("emptyInput");
        }
    });

    /* Fades the inkling invite container in and out */
    $(".inklingInviteButton").live("click", function() {
        var inklingType = $(this).attr("inklingType");
        var inviteContainer = $("#" + inklingType + "InklingInviteContainer");

        // Fade out invite container if it is currently visible
        if (inviteContainer.is(":visible"))
        {
            inviteContainer.fadeOut("medium");
        }

        // Fade in invite container if it is not currently visible
        else
        {
            // Fade out other invite containers
            $(".inklingInviteContainer").fadeOut("medium");

            // Fade in and position invite container
            var inklingImageOffset = $(this).next().offset();
            inviteContainer
                .css("left", inklingImageOffset.left)
                .css("top", inklingImageOffset.top)
                .fadeIn("medium");
        }
    });


    $(".sendInklingInviteButton").live("click", function() {
        var inviteContainer = $(this).parents(".inklingInviteContainer");
        var inviteesContainer = inviteContainer.find(".inviteesContainer");

        // Get the invited members/blots
        var invitees = "";
        inviteesContainer.find(".invitee").each(function(index) {
            invitees += $(this).attr("category") + "|<|>|";
            invitees += $(this).attr("suggestionID") + "|<|>|";
        });

        // If there are any invited members/blot, send the inkling invitations
        if (invitees != "")
        {
            var inklingID = inviteContainer.attr("inklingID");

            // Get the message
            var messageContainer = inviteContainer.find("textarea");
            if (messageContainer.hasClass("emptyInput"))
            {
                var message = "";
            }
            else
            {
                var message = messageContainer.val();
            }

            // Update calendar
            $.ajax({
                type: "POST",
                url: "/inklingInvitations/",
                data: { "invitees" : invitees, "message" : message, "inklingID" : inklingID },
                success: function(invitationID) {
                    var inviteContainerOffset = inviteContainer.offset();
                    inviteContainer.fadeOut("medium", function() {
                        inviteesContainer.empty();
                        inviteContainer.find("input").val("Invite people or blots").addClass("emptyInput");
                        inviteContainer.find("textarea").val("Send a message with this invitation").addClass("emptyInput");
                        var inviteConfirmation = inviteContainer.siblings(".inklingInviteConfirmation");
                        inviteConfirmation
                                .css("left", inviteContainerOffset.left)
                                .css("top", inviteContainerOffset.top)
                                .html("Invitations are being sent...")
                                .fadeIn("medium");

                    $.ajax({
                        type: "POST",
                        url: "/sendInklingInvitations/",
                        data: { "invitees" : invitees, "message" : message, "inklingID" : inklingID, "invitationID" : invitationID },
                        success: function() {
                            inviteConfirmation.html("Invitiations sent!").delay(2000).fadeOut("medium");
                        },
                        error: function(jqXHR, textStatus, error) {
                            if ($("body").attr("debug") == "True")
                            {
                                alert("home.js (6.2): " + error);
                            }
                        }
                    });
                    });
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("home.js (6.1): " + error);
                    }
                }
            });
        }
    });

    /* Fades out the invitation container when a click occurs on an element which is not part of an invitation container */
    $("html").live("click", function(e) {
        if ($(".inklingInviteContainer:visible").length != 0)
        {
            if ((!($(e.target).hasClass("inklingInviteContainer"))) && (!($(e.target).hasClass("inklingInviteSuggestions"))) && (($(e.target).parents(".inklingInviteSuggestions").size() == 0)) && (!($(e.target).hasClass("inklingInviteButton"))) && (($(e.target).parents(".inklingInviteContainer").size() == 0)) && (!($(e.target).parents("html").size() == 0)))
            {
                $(".inklingInviteContainer").fadeOut("medium");
            }
        }
    });

    /* Removes an invitee from the invitees container */
    $(".removeInvitee").live("click", function() {
        $(this).parents(".invitee").remove();
    });

    /* Add an invitee to the invitees container when an invitation suggestion is clicked */
    $(".inklingInviteSuggestions .selectedSuggestion").live("click", function() {
        // Fade out the invitation suggestions
        $(".inklingInviteSuggestions").fadeOut("medium");

        // Get the category and ID of the suggestion
        var suggestionCategory = $(this).attr("category");
        var suggestionID = $(this).attr("suggestionID");

        // Get the inkling invite container
        var inklingInviteContainer = $(this).parents(".inklingInviteSuggestions").prev();

        // Update the inkling container's input and invitees container
        inklingInviteContainer.find("input").val("");
        inklingInviteContainer.find(".inviteesContainer").append("<div class='invitee' category='" + suggestionCategory + "' suggestionID='" + suggestionID + "'><p class='inviteeName'>" + $(this).find("p").attr("fullName") + "</p><div class='removeInvitee'><p class='x'>x</p></div></div>");
    });
    
    /* Sets the current suggestion as the selected suggestion when it is hovered over */
    $(".inklingInviteSuggestions .suggestion").live("hover", function() {
        // If there is a selected item, remove it
        if ($(".selectedSuggestion").length != 0)
        {
            $(".selectedSuggestion").removeClass("selectedSuggestion");
        }

        // Set the suggestion which was hovered over as selected
        $(this).addClass("selectedSuggestion");
    });

    /* Updates the invitation suggestions when the keyboard is pressed */
    $(".inklingInviteContainer input").live("keyup", function(e) {
        var inputElement = $(this);
        
        // Store the suggestions element
        var suggestionsElement = $(this).parent(".inklingInviteContainer").next();

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
                // Get the invited members/blots
                var inviteesContainer = suggestionsElement.prev().find(".inviteesContainer");
                var invitees = "";
                inviteesContainer.find(".invitee").each(function(index) {
                    invitees += $(this).attr("category") + "|<|>|";
                    invitees += $(this).attr("suggestionID") + "|<|>|";
                });

                $.ajax({
                    type: "POST",
                    url: "/suggestions/",
                    data: { "type" : "inklingInvite", "query" : query, "invitees" : invitees },
                    success: function(html) {
                        // Update the HTML of the suggestions element
                        suggestionsElement.html(html);

                        // Set the first suggestion as selected
                        suggestionsElement.find(".suggestion:first").addClass("selectedSuggestion");

                        // Position the suggestions element and fade it in
                        var inputOffset = inputElement.offset();
                        var inputHeight = inputElement.height();
                        suggestionsElement
                            .css("left", inputOffset.left)
                            .css("top", (inputOffset.top + inputHeight + 4))
                            .fadeIn("medium");
                    },
                    error: function(jqXHR, textStatus, error) {
                        if ($("body").attr("debug") == "True")
                        {
                            alert("setMyInklingMobile.js (7): " + error);
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
    
});
