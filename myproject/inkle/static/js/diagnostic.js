/* Copyright 2012 Chad Heise & Jacob Wenger - All Rights Reserved */

$(document).ready(function() {
    // Populate the main content with the initially selected main content link
    loadContent(true, false);

    /* Loads the content for the inputted content type and populates the main content with it */
    function loadContent(firstLoad, fadeSubsectionContentLinks)
    {
        var sectionContentType = $("#diagnosticContentLinks .selectedContentLink").attr("contentType");
        var timeRange = $("#timeContentLinks .selectedSubsectionContentLink").attr("contentType");

        $.ajax({
            type: "POST",
            url: "/diagnostic/" + sectionContentType + "/",
            data: { "firstLoad" : "0", "timeRange" : timeRange },
            success: function(html) {
                // If this is the first load, simply load the edit profile content
                if (firstLoad)
                {
                    $("#diagnosticContent").html(html);
                }

                // Otherwise, fade out the current main content and fade the new main content back in
                else
                {
                    if (fadeSubsectionContentLinks == true)
                    {
                        $("#allDiagnosticContent").fadeOut("medium", function () {
                            if ((sectionContentType == "members") || (sectionContentType == "inklings") || (sectionContentType == "invitations"))
                            {
                                $("#timeContentLinks").show();
                            }
                            else
                            {
                                $("#timeContentLinks").hide();
                            }

                            // Set the selected subsection content link to "All"
                            $("#timeContentLinks p").removeClass("selectedSubsectionContentLink");
                            $("#timeContentLinks p:first").addClass("selectedSubsectionContentLink");

                            $("#diagnosticContent").html(html);
                            $(this).fadeIn("medium");
                        });
                    }
                    else
                    {
                        $("#diagnosticContent").fadeOut("medium", function () {
                            $(this).html(html).fadeIn("medium");
                        });
                    }
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
            loadContent(false, true);
        }
    });

    /* Updates the subsection when one of the subsection content links is clicked */
    $("#timeContentLinks p").click(function() {
        // Only update the content if the subsection content link which is clicked is not the currently selected one
        if (!$(this).hasClass("selectedSubsectionContentLink"))
        {
            // Get the this element
            var thisElement = $(this);

            // Update the selected subsection content link
            $(this).siblings().removeClass("selectedSubsectionContentLink");
            $(this).addClass("selectedSubsectionContentLink");

            // Load the content for the clicked main content link
            loadContent(false, false);
        }
    });
});
