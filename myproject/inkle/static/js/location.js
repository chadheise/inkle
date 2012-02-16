/* Copyright 2012 Chad Heise & Jacob Wenger - All Rights Reserved */

$(document).ready(function() {
    showHideContent( $(".selectedContentLink").attr("contentType") ); //Show and hide appropriate content on page load
    
    /* Returns the currently selected date */
    function getSelectedDate(delimiter)
    {
        return date = $("#calendar").attr("selectedMonth") + delimiter + $("#calendar").attr("selectedDay") + delimiter + $("#calendar").attr("selectedYear");
    }

    // Update the location inklings when one of the main content links is clicked
    $("#locationInklingsContentLinks p").click(function() {
        // Only change the content if we click a content link which is not already selected
        if (!$(this).hasClass("selectedContentLink"))
        {
            // Remove the selected content link class from the appropriate element and add it to the clicked content link
            $("#locationInklingsContentLinks .selectedContentLink").removeClass("selectedContentLink");
            $(this).addClass("selectedContentLink");

            showHideContent($(this).attr("contentType"));

        }
    });

    function showHideContent(contentType) {
        // Depending on which content link was clicked, hide and show the appropriate results
        $("#locationInklingsContent").fadeOut(function() {
            if (contentType == "all")
            {
                $("#dinnerContent").show();
                $("#pregameContent").show();
                $("#mainEventContent").show();
                $(".subsectionTitle").show();
            }
            else if (contentType == "dinner")
            {
                $("#dinnerContent").show();
                $("#pregameContent").hide();
                $("#mainEventContent").hide();
                $(".subsectionTitle").hide();
            }
            else if (contentType == "pregame")
            {
                $("#dinnerContent").hide();
                $("#pregameContent").show();
                $("#mainEventContent").hide();
                $(".subsectionTitle").hide();
            }
            else if (contentType == "mainEvent")
            {
                $("#dinnerContent").hide();
                $("#pregameContent").hide();
                $("#mainEventContent").show();
                $(".subsectionTitle").hide();
            }

            $("#locationInklingsContent").fadeIn();
        });
    }

    // Show the edit location content when the edit location button is clicked
    $("#locationEditButton").live("click", function() {
        // Replace the location info with the the location info edit content
        $("#locationInfo").fadeOut("medium", function() {
            // Get the location ID
            var locationID = $("#locationEditButton").attr("locationID");

            // Get the edit location content
            $.ajax({
                type: "POST",
                url: "/getEditLocationHtml/",
                data: {"locationID" : locationID},
                success: function(html) {
                    $("#locationInfo").html(html);
                    $("#locationInfo").fadeIn("medium");
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("location.js (1): " + error);
                    }
                }
            });
        });
    });
    
    // Update the location's info in the database when the location submit button is clicked
    $("#locationSubmitButton").live("click", function() {
        // Replace the location edit info content with the the location info and update the location in the database
        $("#locationInfo").fadeOut("medium", function() {
            // Get the location ID
            var locationID = $("#locationSubmitButton").attr("locationID");
        
            // Get the location input values
            var name = $("#nameInput").val();
            var street = $("#streetInput").val();
            var city = $("#cityInput").val();
            var state = $("#stateSelect option:selected").val();
            var zipCode = $("#zipCodeInput").val();
            var phone = $("#phoneInput").val();
            var website = $("#websiteInput").val();
            var category = $("#categorySelect option:selected").val();
            var image = $("#imageInput").val();
            
            // Update the location in the database and show the location info
            $.ajax({
                type: "POST",
                url: "/editLocation/",
                data: {"locationID" : locationID, "name" : name, "street" : street, "city" : city, "state" : state, "zipCode" : zipCode, "phone" : phone, "website" : website, "category" : category, "image" : image},
                success: function(html) {
                    // Update the location info content
                    $("#locationInfo").html(html);

                    // Update the location's name if it has changed
                    if (name != $("#locationName").text())
                    {
                        $("#locationName").fadeOut("medium", function () {
                            $("#locationName").text(name);
                            $("#locationName").fadeIn("medium");
                        });
                    }

                    // Update the location's image if it has changed
                    if (image != $("#locationImage").attr("image"))
                    {
                        $("#locationImage").fadeOut("medium", function() {
                            $("#locationImage").attr("src", "/static/media/images/locations/" + image);
                            $("#locationImage").attr("image", image);
                            $("#locationImage").fadeIn("medium");
                        });
                    }

                    // Fade the location info content back in
                    $("#locationInfo").fadeIn("medium");
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("location.js (2): " + error);
                    }
                }
            });
        });
    });
    
    // Show the location info content when the cancel button is clicked
    $("#locationCancelButton").live("click", function() {
        // Replace the location info edit content with the the location info
        $("#locationInfo").fadeOut("medium", function() {
            // Get the location ID
            var locationID = $("#locationSubmitButton").attr("locationID");
       
            // Show the location info
            $.ajax({
                type: "POST",
                url: "/editLocation/",
                data: {"locationID" : locationID},
                success: function(html) {
                    $("#locationInfo").html(html);
                    $("#locationInfo").fadeIn("medium");
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("location.js (3): " + error);
                    }
                }
            });
        });
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

            // Get the location and date information
            var location_id = (window.location.pathname).split('/')[2];

            // Get the clicked date and update the calendar's selected date information
            var calendar = $("#calendar");
            var month = $(this).attr("month");
            var day = $(this).attr("day");
            var year = $(this).attr("year");
            calendar.attr("selectedMonth", month);
            calendar.attr("selectedDay", day);
            calendar.attr("selectedYear", year);
            calendar.attr("selectedDate", $(this).attr("date"));
            var date = getSelectedDate("/");
              
            // Update location inklings
            $.ajax({
                type: "POST",
                url: "/getLocationInklings/",
                data: {"location_id" : location_id, "year" : year, "month" : month, "day": day},
                success: function(html) {
                    $("#locationInklingsContent").fadeOut("medium", function() {
                        $("#locationInklingsContent").html(html);
                            showHideContent( $(".selectedContentLink").attr("contentType") );
                    });
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("location.js (4): " + error);
                    }
                }
            });
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

                    // Get the location and date information
                    var location_id = (window.location.pathname).split('/')[2];

                    var calendar = $("#calendar");
                    var month = calendar.attr("selectedMonth");
                    var day = calendar.attr("selectedDay");
                    var year = calendar.attr("selectedYear");
              
                    // Update location inklings
                    $.ajax({
                        type: "POST",
                        url: "/getLocationInklings/",
                        data: {"location_id" : location_id, "year" : year, "month" : month, "day": day},
                        success: function(html) {
                            $("#locationInklingsContent").fadeOut("medium", function() {
                                $("#locationInklingsContent").html(html);
                                    showHideContent( $(".selectedContentLink").attr("contentType") );
                            });
                        },
                        error: function(jqXHR, textStatus, error) {
                            if ($("body").attr("debug") == "True")
                            {
                                alert("location.js (5.2): " + error);
                            }
                        }
                    });
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("location.js (5.1): " + error);
                    }
                }
            });
        }
    });
});
