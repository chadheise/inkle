/* Copyright 2012 Chad Heise & Jacob Wenger - All Rights Reserved */

$(document).ready(function() {
    // Populate the main content with the initially selected main content link
    var contentType = $("#editProfileContentLinks .selectedContentLink").attr("contentType");
    loadContent(contentType, true);

    // "Pointer" to jcrop element
    var jcrop_api;

    /* Updates the coordinates for the JCrop element */
    function updateCoords(c)
    {
        $("#cropX").val(c.x);
        $("#cropY").val(c.y);
        $("#cropX2").val(c.x2);
        $("#cropY2").val(c.y2);
        $("#cropWidth").val(c.w);
        $("#cropHeight").val(c.h);
    }

    /* Clears the coordinates for the JCrop element */
    function clearCoords()
    {
        $("#cropX").val("");
        $("#cropY").val("");
        $("#cropX2").val("");
        $("#cropY2").val("");
        $("#cropWidth").val("");
        $("#cropHeight").val("");
    }

    /* Loads the content for the inputted content type and populates the main content with it */
    function loadContent(contentType, firstLoad)
    {
        $.ajax({
            type: "POST",
            url: "/" + contentType + "/",
            data: {},
            success: function(html) {
                // If this is the first load, simply load the edit profile content
                if (firstLoad)
                {
                    loadContentHelper(html, contentType);
                }

                // Otherwise, fade out the current edit profile content and fade the new edit profile content back in
                else
                {
                    $("#editProfileContent").fadeOut("medium", function () {
                        loadContentHelper(html, contentType, function() {
                            $("#editProfileContent").fadeIn("medium");
                        });
                    });
                }
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("editProfile.js (1): " + error);
                }
            }
        });
    }
 
    /* Helper function for loadContent() which replaces the edit profile content HTML*/
    function loadContentHelper(html, contentType, callback)
    {
        // Update the main content with the HTML returned from the AJAX call
        $("#editProfileContent").html(html);

        // Execute the callback function if there is one
        if (callback)
        {
            callback();
        }
    }

    /* Updates the main content when one of the main content links is clicked */
    $("#editProfileContentLinks p").click(function() {
        // Only update the content if the main content link which is clicked is not the currently selected one
        if (!$(this).hasClass("selectedContentLink"))
        {
            // Update the selected main content link
            $("#editProfileContentLinks .selectedContentLink").removeClass("selectedContentLink");
            $(this).addClass("selectedContentLink");

            // Load the content for the clicked main content link
            var contentType = $(this).attr("contentType");
            loadContent(contentType, false);
        }
    });

    /* Define a startsWith() string function */
    if(!String.prototype.startsWith) {
        String.prototype.startsWith = function (str) {
            return !this.indexOf(str);
        }
    }

    $("#editProfileInformationButton").live("click", function() {
        var firstName = $("#firstName").val();
        var lastName = $("#lastName").val();
        var phone1 = $("#phone1").val();
        var phone2 = $("#phone2").val();
        var phone3 = $("#phone3").val();
        var street = $("#street").val();
        var city = $("#city").val();
        var state = $("#state option:selected").val(); 
        var zipCode = $("#zipCode").val();
        var month = $("#month option:selected").val(); 
        var day = $("#day option:selected").val(); 
        var year = $("#year option:selected").val(); 
        var gender = $("#gender option:selected").val(); 

        $.ajax({
            type: "POST",
            url: "/editProfileInformation/",
            data: { "firstName" : firstName, "lastName" : lastName, "phone1" : phone1, "phone2" : phone2, "phone3" : phone3, "street" : street, "city" : city, "state" : state, "zipCode" : zipCode, "month" : month, "day" : day, "year" : year, "gender" : gender },
            success: function(html) {
                if (html.startsWith("\n"))
                {
                    $("#editProfileContent").html(html);
                }
                else
                {
                    $(".invalid").removeClass("invalid");
                    $(".errors").remove();
                    $("#editProfileInformationContent").fadeOut("medium", function() {
                        $("#editProfileInformationConfirmation").fadeIn("medium").delay(2000).fadeOut("medium", function() {
                            $("#editProfileInformationContent").fadeIn("medium");
                        });
                    });
                }
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("editProfile.js (2): " + error);
                }
            }
        });
    });
   
    /* Edit the logged in member's profile privacy settings when the "Edit profile privacy" button is clicked */
    $("#editProfilePrivacyButton").live("click", function() {
        // Get the privacy settings
        var locationPrivacy = $("#locationPrivacy option:selected").val(); 
        var emailPrivacy = $("#emailPrivacy option:selected").val(); 
        var phonePrivacy = $("#phonePrivacy option:selected").val(); 
        var birthdayPrivacy = $("#birthdayPrivacy option:selected").val(); 
        var followersPrivacy = $("#followersPrivacy option:selected").val(); 
        var followingsPrivacy = $("#followingsPrivacy option:selected").val(); 
        var networksPrivacy = $("#networksPrivacy option:selected").val(); 
        var inklingsPrivacy = $("#inklingsPrivacy option:selected").val();
        var placePrivacy = $("#placePrivacy option:selected").val(); 

        // Edit the logged in member's profile privacy settings
        $.ajax({
            type: "POST",
            url: "/editProfilePrivacy/",
            data: { "locationPrivacy" : locationPrivacy, "emailPrivacy" : emailPrivacy, "phonePrivacy" : phonePrivacy, "birthdayPrivacy" : birthdayPrivacy, "followersPrivacy" : followersPrivacy, "followingsPrivacy" : followingsPrivacy, "networksPrivacy" : networksPrivacy, "placePrivacy" : placePrivacy, "inklingsPrivacy" : inklingsPrivacy },
            success: function(html) {
                // Fade out the privacy content, fade in the confirmation message, and fade back in the privacy content after a delay
                $("#editProfilePrivacyContent").fadeOut("medium", function() {
                    $("#editProfilePrivacyConfirmation").fadeIn("medium").delay(2000).fadeOut("medium", function() {
                        $("#editProfilePrivacyContent").fadeIn("medium");
                    });
                });
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("editProfile.js (3): " + error);
                }
            }
        });
    });

    /* Edit the logged in member's email preferences when the "Edit email preferences" button is clicked */
    $("#editProfileEmailPreferencesButton").live("click", function() {
        // Get the email preferences
        var requestedPreference = $("#requestedPreference").is(":checked"); 
        var acceptedPreference = $("#acceptedPreference").is(":checked"); 
        var invitedPreference = $("#invitedPreference").is(":checked"); 
        var generalPreference = $("#generalPreference").is(":checked"); 

        // Edit the logged in member's email preferences settings
        $.ajax({
            type: "POST",
            url: "/editProfileEmailPreferences/",
            data: { "requestedPreference" : requestedPreference, "acceptedPreference" : acceptedPreference, "invitedPreference" : invitedPreference, "generalPreference" : generalPreference, }, 
            success: function(html) {
                // Fade out the email preferences content, fade in the confirmation message, and fade back in the email preferences content after a delay
                $("#editProfileEmailPreferencesContent").fadeOut("medium", function() {
                    $("#editProfileEmailPreferencesConfirmation").fadeIn("medium").delay(2000).fadeOut("medium", function() {
                        $("#editProfileEmailPreferencesContent").fadeIn("medium");
                    });
                });
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("editProfile.js (4): " + error);
                }
            }
        });
    });

    /* Make the iframe the target of the "Edit profile picture" button */
    $("#editProfilePictureForm").live("submit", function() {
        $("#editProfilePictureForm").attr("target", "uploadTarget");
    });

    /* Edit the logged in member's profile picture when the "Edit profile picture" button is clicked */
    $("#editProfilePictureButton").live("click", function() {
        // If a file has been selected, upload the image and load the crop picture content
        if ($("#newProfilePicture").val())
        {
            // Hide all the errors
            $("#uploadProfilePictureErrors").hide();
            $("#cropProfilePictureErrors").hide();

            // Fade out the profile picture content, fade in the confirmation message and update the profile picture, and fade back in the profile picture content after a delay
            $("#editProfilePictureContent").fadeOut("medium", function() {
                // Update the uploaded image's source
                var date = new Date()
                var imageSource = $("#headerMemberImage").attr("src").split(".")[0] + "_upload.jpg?" + date.getTime();
                var imageSource = $("#uploadedProfileImage").attr("src") + "?" + date.getTime();
                $("#uploadedProfileImage").attr("src", imageSource);

                // Fade in the crop content and attached the Jcrop element
                $("#cropProfilePictureContent").fadeIn("medium", function() {
                    $("#uploadedProfileImage").Jcrop(
                        {
                            aspectRatio: 1,
                            onSelect: updateCoords,
                            onRelease: clearCoords
                        },
                        function() {
                            jcrop_api = this;
                        }
                    );
                });
            });
        }

        // If no file has been selected, show the errors
        else
        {
            $("#uploadProfilePictureErrors").show();
        }
    });

    /* Crops the image */
    $("#cropProfilePictureButton").live("click", function() {
        // Get the cropping selection data
        var x = $("#cropX").val();
        var y = $("#cropY").val();
        var x2 = $("#cropX2").val();
        var y2 = $("#cropY2").val();
        var width = $("#cropWidth").val();
        var height = $("#cropHeight").val();

        // If the cropping selection data exists, crop the picture and show the save picture content
        if ((x != "") && (y != "") && (x2 != "") && (y2 != "") && (width != "") && (height != ""))
        {
            // Hide the errors
            $("#cropProfilePictureErrors").hide();

            // Crop the picture and show the save picture content
            $.ajax({
                type: "POST",
                url: "/cropProfilePicture/",
                data: { "x" : x, "y" : y, "x2" : x2, "y2" : y2, "width" : width, "height" : height },
                success: function(html) {
                    // Update the cropped image's source
                    var date = new Date()
                    var imageSource = $("#croppedProfileImage").attr("src") + "?" + date.getTime();
                    $("#croppedProfileImage").attr("src", imageSource);
    
                    // Fade in the save picture content
                    $("#cropProfilePictureContent").fadeOut("medium", function() {
                        $("#saveProfilePictureContent").fadeIn("medium");
                    });
                },
                error: function(jqXHR, textStatus, error) {
                    if ($("body").attr("debug") == "True")
                    {
                        alert("editProfile.js (5): " + error);
                    }
                }
            });
        }

        // If no cropping selection exists, show the errors
        else
        {
            $("#cropProfilePictureErrors").show();
        }
    });

    /* Fades back in the upload picture content and destroy the Jcrop element if the "Back" button is pressed on the save picture page */
    $("#cropProfilePictureBackButton").live("click", function() {
        $("#cropProfilePictureContent").fadeOut("medium", function() {
            jcrop_api.destroy();
            clearCoords();
            $("#editProfilePictureContent").fadeIn("medium");
        });
    });

    /* Saves the cropped picture as the logged in member's profile picture */
    $("#saveProfilePictureButton").live("click", function() {
        $.ajax({
            type: "POST",
            url: "/saveProfilePicture/",
            data: { },
            success: function(html) {
                // Fade out the save picture content and fade in the confirmation message
                $("#saveProfilePictureContent").fadeOut("medium", function() {
                    $("#editProfilePictureConfirmation").fadeIn("medium");

                    // Update the header image's source
                    var date = new Date()
                    var imageSource = $("#headerMemberImage").attr("src") + "?" + date.getTime();
                    $("#headerMemberImage").attr("src", imageSource);
                });
            },
            error: function(jqXHR, textStatus, error) {
                if ($("body").attr("debug") == "True")
                {
                    alert("editProfile.js (6): " + error);
                }
            }
        });
    });

    /* Fades back in the crop picture content if the "Back" button is pressed on the save picture page */
    $("#saveProfilePictureBackButton").live("click", function() {
        $("#saveProfilePictureContent").fadeOut("medium", function() {
            $("#cropProfilePictureContent").fadeIn("medium");
        });
    });
});
