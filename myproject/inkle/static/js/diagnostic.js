/* Copyright 2012 Chad Heise & Jacob Wenger - All Rights Reserved */

$(document).ready(function() {
    // Populate the main content with the initially selected main content link
    var contentType = $("#diagnosticContentLinks .selectedContentLink").attr("contentType");
    loadContent(contentType, true);

    /* Loads the content for the inputted content type and populates the main content with it */
    function loadContent(contentType, firstLoad)
    {
        $.ajax({
            type: "POST",
            url: "/diagnostic/" + contentType + "/",
            data: { "firstLoad" : "0" },
            success: function(html) {
                // If this is the first load, simply load the edit profile content
                if (firstLoad)
                {
                    $("#diagnosticContent").html(html);
                }

                // Otherwise, fade out the current main content and fade the new main content back in
                else
                {
                    $("#diagnosticContent").fadeOut("medium", function () {
                        $(this).html(html).fadeIn("medium");
                    });
                }
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("diagnostic.js (1): " + error);
                }
            }
        });
    }

    /* Updates the main content when one of the main content links is clicked */
    $("#diagnosticContentLinks p").click(function() {
        // Only update the content if the main content link which is clicked is not the currently selected one
        if (!$(this).hasClass("selectedContentLink"))
        {
            // Update the selected main content link
            $("#diagnosticContentLinks .selectedContentLink").removeClass("selectedContentLink");
            $(this).addClass("selectedContentLink");

            // Load the content for the clicked main content link
            var contentType = $(this).attr("contentType");
            loadContent(contentType, false);
        }
    });
});
