/* Copyright 2012 Chad Heise & Jacob Wenger - All Rights Reserved */

$(document).ready(function() {
    /* Returns the currently selected date */
    function getSelectedDate(delimiter)
    {
        return date = $("#calendar").attr("selectedMonth") + delimiter + $("#calendar").attr("selectedDay") + delimiter + $("#calendar").attr("selectedYear");
    }

    // Populate the main content with the initially selected main content link
    var contentType = $("#manageContentLinks .selectedContentLink").attr("contentType");
    var date = getSelectedDate("/");
    loadContent(contentType, date, true);

    /* Loads the content for the inputted content type and populates the main content with it */
    function loadContent(contentType, date, firstLoad)
    {
        var date = getSelectedDate("/");
        $.ajax({
            type: "POST",
            url: "/" + contentType + "/",
            data: {"date" : date},
            success: function(html) {
                // If this is the first load, simply load the manage content
                if (firstLoad)
                {
                    loadContentHelper(html, contentType);
                    if (contentType == "notifications") {
                        $("#notificationsContentLinks").show();
                    }
                    else if (contentType == "place") {
                        $("#memberPlaceContentLinks").show();
                        $("#calendarContainer").show();  
                    }
                    $(".blot").each(function() {
                        var blotP = $(this).find("p");
                        var marginTop = ($(this).height() - blotP.height()) / 2;
                        blotP.css("margin-top", marginTop + "px");
                        });
                }
                // Otherwise, fade out the current manage content and fade the new manage content back in
                else
                {
                    if (contentType == "notifications") {
                        $("#memberPlaceContentLinks").fadeOut("medium");
                        $("#calendarContainer").fadeOut("medium");
                    }
                    else if(contentType == "place") {
                        $("#notificationsContentLinks").fadeOut("medium");
                        $("#memberPlaceContentLinks").delay(400).fadeIn("medium");
                        $("#calendarContainer").delay(400).fadeIn("medium");    
                    }
                    else {
                        $("#notificationsContentLinks").fadeOut("medium");
                        $("#memberPlaceContentLinks").fadeOut("medium");
                        $("#calendarContainer").fadeOut("medium");
                    }
                    
                    $("#mainManageContent").fadeOut("medium", function () {
                        if (contentType == "notifications") {
                            $("#notificationsContentLinks").fadeIn("medium");
                        }
                        loadContentHelper(html, contentType, function() {
                            $("#mainManageContent").fadeIn("medium", function() {
                                $(".blot").each(function() {
                                    var blotP = $(this).find("p");
                                    var marginTop = ($(this).height() - blotP.height()) / 2;
                                    blotP.css("margin-top", marginTop + "px");
                                });
                            });
                        });
                    });
                }
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("manage.js (1): " + error);
                }
            }
        });
    }
 
    /* Helper function for loadContent() which replaces the manage content HTML*/
    function loadContentHelper(html, contentType, callback)
    {
        // Update the main content with the HTML returned from the AJAX call
        $("#mainManageContent").html(html);
        
        if (contentType == "place") {
            $("#memberPlaceContentLinks").children().each(function() {
                if ($(this).hasClass("selectedSubsectionContentLink")) {
                    if ($(this).attr("contentType") == "all") {
                        $(".subsectionTitle").show();
                        $(".inklingContent").show();
                    }
                    else if ($(this).attr("contentType") == "dinner") {
                        $(".subsectionTitle").hide();
                        $("#dinnerContent").show()
                    }
                    else if ($(this).attr("contentType") == "pregame") {
                        $(".subsectionTitle").hide();
                        $("#pregameContent").show()
                    }
                    else if ($(this).attr("contentType") == "mainEvent") {
                        $(".subsectionTitle").hide();
                        $("#mainEventContent").show()
                    }  
                }
            });       
        }

        // Execute the callback function if there is one
        if (callback)
        {
            callback();
        }
    }

    /* Updates the main content when one of the main content links is clicked */
    $("#manageContentLinks p").click(function() {
        // Only update the content if the main content link which is clicked is not the currently selected one
        if (!$(this).hasClass("selectedContentLink"))
        {
            // Update the selected main content link
            $("#manageContentLinks .selectedContentLink").removeClass("selectedContentLink");
            $(this).addClass("selectedContentLink");

            // Load the content for the clicked main content link
            var contentType = $(this).attr("contentType");
            loadContent(contentType, false);
        }
    });

    /* Updates the subsection when one of the subsection content links is clicked */
    $("#memberPlaceContentLinks p").click(function() {
        // Only update the content if the subsection content link which is clicked is not the currently selected one
        if (!$(this).hasClass("selectedSubsectionContentLink"))
        {
            // Get the this element
            var thisElement = $(this);

            // Update the selected subsection content link
            $(this).siblings().removeClass("selectedSubsectionContentLink");
            $(this).addClass("selectedSubsectionContentLink");

            $("#mainManageContent").fadeOut("medium", function() {
                // Get the content type
                var contentType = thisElement.attr("contentType");

                // Load the content for the clicked subsection inkling type
                if (contentType == "all")
                {
                    $(".subsectionTitle").show();
                    $(".inklingContent").show();
                }
                else if (contentType == "dinner")
                {
                    $(".subsectionTitle").hide();
                    $(".inklingContent").hide();
                    $("#dinnerContent").show();
                }
                else if (contentType == "pregame")
                {
                    $(".subsectionTitle").hide();
                    $(".inklingContent").hide();
                    $("#pregameContent").show();
                }
                else if (contentType == "mainEvent")
                {
                    $(".subsectionTitle").hide();
                    $(".inklingContent").hide();
                    $("#mainEventContent").show();
                }

                $("#mainManageContent").fadeIn("medium");
            });
        }
    });

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
            var month = $(this).attr("month");
            var day = $(this).attr("day");
            var year = $(this).attr("year");
            calendar.attr("selectedMonth", month);
            calendar.attr("selectedDay", day);
            calendar.attr("selectedYear", year);
            calendar.attr("selectedDate", $(this).attr("date"));
            var date = getSelectedDate("/");
              
            // Update content
            var contentType = $("#manageContentLinks .selectedContentLink").attr("contentType");
            loadContent(contentType, date, false);
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

                    // Get the selected date (now this is today's date) and the content type
                    var date = getSelectedDate("/");
                    var contentType = $("#manageContentLinks .selectedContentLink").attr("contentType");

                    // Update the content type
                    loadContent(contentType, date, false);
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("manage.js (2): " + error);
                    }
                }
           });
        }
    });
});
