document.addEventListener("DOMContentLoaded", function () {
  var timelines = Array.from(document.querySelectorAll(".timeline"));
  var draggings = [];
  var activeVideos = [];

  timelines.forEach(function (timeline, index) {
    var scrubber = timeline.querySelector(".scrubber");
    var mediaContainer = timeline.querySelector(".media-container");
    var mediaItems = Array.from(mediaContainer.querySelectorAll(".media"));

    function getTotalDuration(items) {
      return items.reduce(
        (total, item) => total + parseFloat(item.getAttribute("data-duration")),
        0
      );
    }

    function getPosition(event) {
      var timelineRect = timeline.getBoundingClientRect();
      var clientX =
        event.clientX || (event.touches ? event.touches[0].clientX : 0);
      return parseFloat(
        ((clientX - timelineRect.left) / timelineRect.width).toFixed(2)
      ); // Rounded to two decimals
    }

    function handleMoveEvent(event) {
      event.preventDefault();
      if (draggings[index]) {
        var position = getPosition(event);
        var totalDuration = getTotalDuration(mediaItems); // Recalculate total duration
        var currentTime = position * totalDuration;
        updateScrubberPosition(scrubber, position);
        updateMedia(mediaItems, currentTime, totalDuration, index); // Pass totalDuration here
      }
    }

    function handleStartEvent(event) {
      draggings[index] = true;
      timeline.classList.add("dragging");

      var position = getPosition(event);
      var totalDuration = getTotalDuration(mediaItems); // Recalculate total duration
      var currentTime = position * totalDuration;

      updateScrubberPosition(scrubber, position);
      updateMedia(mediaItems, currentTime, totalDuration, index); // Pass totalDuration here
    }

    function handleEndEvent() {
      if (draggings[index]) {
        draggings[index] = false;
        timeline.classList.remove("dragging");
      }
    }

    timeline.addEventListener("touchmove", handleMoveEvent);
    timeline.addEventListener("touchstart", handleStartEvent);
    mediaContainer.addEventListener("touchstart", handleStartEvent);
    window.addEventListener("touchend", handleEndEvent);

    timeline.addEventListener("mousemove", handleMoveEvent);
    timeline.addEventListener("mousedown", handleStartEvent);
    mediaContainer.addEventListener("mouseenter", handleStartEvent);
    window.addEventListener("mouseup", handleEndEvent);

    // Adjust data-duration of videos based on their actual duration
    mediaItems.forEach(function (item) {
      if (item.getAttribute("data-type") === "video") {
        var video = item.querySelector("video");
        video.onloadedmetadata = function () {
          var duration = video.duration;
          item.setAttribute("data-duration", duration.toFixed(1));
        };
      }
    });
  });

  function updateScrubberPosition(scrubber, position) {
    scrubber.style.left = (position * 100).toFixed(2) + "%"; // Rounded to two decimals
  }

  function updateMedia(mediaItems, currentTime, totalDuration, index) {
    // Accept totalDuration as parameter
    var cumulativeTime = 0;
    var activeMedia = null;

    mediaItems.forEach(function (item) {
      var duration = parseFloat(item.getAttribute("data-duration"));
      cumulativeTime += duration;

      if (!activeMedia && currentTime < cumulativeTime) {
        activeMedia = item;
        // Define the duration variable within this context
        var duration = parseFloat(item.getAttribute("data-duration"));
        // Calculate the playback time using totalDuration
        var playbackTime = currentTime - (cumulativeTime - totalDuration);
        // Assign the playback time to the active media
        if (activeMedia.getAttribute("data-type") === "video") {
          var video = activeMedia.querySelector("video");
          // Capture frame at the given playback time
          captureFrame(video, playbackTime, item);
        }
      }
    });

    mediaItems.forEach(function (item) {
      if (item === activeMedia) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  function captureFrame(video, playbackTime, item) {
    video.pause(); // Pause the video
    video.currentTime = playbackTime; // Set the playback time
    video.onseeked = function () {
      // Capture the frame
      var canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      var imageUrl = canvas.toDataURL();
      item.style.backgroundImage = `url(${imageUrl})`;
    };
  }
});
