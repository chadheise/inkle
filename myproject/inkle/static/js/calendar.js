/* Copyright 2012 Chad Heise & Jacob Wenger - All Rights Reserved */

$(document).ready(function() {

    /* Shifts the calendar over when an arrow button is clicked */
    $(".calendarArrow").live("click", function() {
        // Determine which arrow button was clicked
        var arrow = "left";
        if ($(this).attr("id") == "calendarArrowRight")
        {
            arrow = "right";
        }

        // Get the first date
        var year = $(".dateContainer:first").attr("year");
        var month = $(".dateContainer:first").attr("month");
        var day = $(".dateContainer:first").attr("day");

        // Get the selected date
        var selectedYear = $("#calendar").attr("selectedYear");
        var selectedMonth = $("#calendar").attr("selectedMonth");
        var selectedDay = $("#calendar").attr("selectedDay");

        //Get the number of calendar dates to display
        numDates = $(".dateContainer").size();

        // Update calendar
        $.ajax({
            type: "POST",
            url: "/dateSelect/",
            data: {"arrow" : arrow, "numDates" : numDates, "firstYear" : year, "firstMonth" : month, "firstDay" : day, "selectedYear" : selectedYear, "selectedMonth" : selectedMonth, "selectedDay" : selectedDay},
            success: function(html) {
                $("#calendarContainer").html(html);
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("calendar.js (2): " + error);
                }
            }
        });
    });
});
