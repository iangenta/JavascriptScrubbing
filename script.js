var timeline = document.getElementById('timeline');
var scrubber = document.getElementById('scrubber');
var mediaContainer = document.getElementById('media-container');
var mediaItems = Array.from(document.querySelectorAll('.media'));
var totalDuration = mediaItems.reduce((total, item) => total + parseFloat(item.getAttribute('data-duration')), 0);
var dragging = false;
var activeVideo = null;

// Function to get the position on the timeline based on event coordinates

function getPosition(event) {
  var timelineRect = timeline.getBoundingClientRect();
  var clientX = event.clientX || event.touches[0].clientX;
  return (clientX - timelineRect.left) / timelineRect.width;
}

// Update the timeline position and active media based on mouse movement and touch events

function handleMoveEvent(event) {
  event.preventDefault();
  if (!dragging) {
    var position = getPosition(event);
    var currentTime = position * totalDuration;

    updateScrubberPosition(position);
    updateMedia(currentTime);
  }
}

function handleStartEvent(event) {
  dragging = true;
  timeline.classList.add('dragging');

  var position = getPosition(event);
  var currentTime = position * totalDuration;

  updateScrubberPosition(position);
  updateMedia(currentTime);
}

function handleEndEvent() {
  if (dragging) {
    dragging = false;
    timeline.classList.remove('dragging');
    if (activeVideo) {
      activeVideo.play();
    }
  }
}

function handleTouchMove(event) {
  event.preventDefault();
  if (dragging) {
    var position = getPosition(event);
    var currentTime = position * totalDuration;

    updateScrubberPosition(position);
    updateMedia(currentTime);
  }
}

timeline.addEventListener('mousemove', handleMoveEvent);
timeline.addEventListener('mousedown', handleStartEvent);
window.addEventListener('mouseup', handleEndEvent);

timeline.addEventListener('touchmove', handleTouchMove, { passive: false });
timeline.addEventListener('touchstart', handleStartEvent, { passive: false });
window.addEventListener('touchend', handleEndEvent);

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
