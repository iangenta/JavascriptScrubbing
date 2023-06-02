var timeline = document.getElementById('timeline');
var scrubber = document.getElementById('scrubber');
var mediaContainer = document.getElementById('media-container');
var mediaItems = Array.from(document.querySelectorAll('.media'));
var totalDuration = mediaItems.reduce((total, item) => total + parseFloat(item.getAttribute('data-duration')), 0);
var dragging = false;
var activeVideo = null;

// Update the timeline position and active media based on mouse movement

timeline.addEventListener('mousemove', function(e) {
  if (!dragging) {
    var timelineRect = timeline.getBoundingClientRect();
    var position = (e.clientX - timelineRect.left) / timelineRect.width;
    var currentTime = position * totalDuration;

    updateScrubberPosition(position);
    updateMedia(currentTime);
  }
});
// Start dragging the scrubber and update the timeline position and active media

timeline.addEventListener('mousedown', function(e) {
  dragging = true;
  timeline.classList.add('dragging');

  var timelineRect = timeline.getBoundingClientRect();
  var position = (e.clientX - timelineRect.left) / timelineRect.width;
  var currentTime = position * totalDuration;

  updateScrubberPosition(position);
  updateMedia(currentTime);
});
// Stop dragging the scrubber

window.addEventListener('mouseup', function() {
  if (dragging) {
    dragging = false;
    timeline.classList.remove('dragging');
    if (activeVideo) {
      activeVideo.play();
    }
  }
});
// Continue updating the timeline position and active media while dragging

window.addEventListener('mousemove', function(e) {
  if (dragging) {
    var timelineRect = timeline.getBoundingClientRect();
    var position = (e.clientX - timelineRect.left) / timelineRect.width;
    var currentTime = position * totalDuration;

    updateScrubberPosition(position);
    updateMedia(currentTime);
  }
});
// Update the position of the scrubber on the timeline

function updateScrubberPosition(position) {
  scrubber.style.left = position * 100 + '%';
}
// Update the active media based on the current time

function updateMedia(currentTime) {
  var cumulativeTime = 0;
  var activeMedia = null;

  mediaItems.forEach(function(item) {
    var duration = parseFloat(item.getAttribute('data-duration'));
    cumulativeTime += duration;

    if (!activeMedia && currentTime < cumulativeTime) {
      activeMedia = item;
      var mediaType = item.getAttribute('data-type');
      var mediaContent = item.querySelector('video') || item.querySelector('img');

      if (mediaType === 'video') {
        var position = (currentTime - (cumulativeTime - duration)) / duration;
        mediaContent.currentTime = position * mediaContent.duration;
        activeVideo = mediaContent;
      }
    }
  });

  mediaItems.forEach(function(item) {
    if (item === activeMedia) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
