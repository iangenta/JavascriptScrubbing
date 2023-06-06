var timelines = Array.from(document.querySelectorAll('.timeline'));
var draggings = [];
var activeVideos = [];

timelines.forEach(function(timeline, index) {
  var scrubber = timeline.querySelector('.scrubber');
  var mediaContainer = timeline.querySelector('.media-container');
  var mediaItems = Array.from(mediaContainer.querySelectorAll('.media'));
  var totalDuration = mediaItems.reduce((total, item) => total + parseFloat(item.getAttribute('data-duration')), 0);

  function getPosition(event) {
    var timelineRect = timeline.getBoundingClientRect();
    var clientX = event.clientX || event.touches[0].clientX;
    return parseFloat(((clientX - timelineRect.left) / timelineRect.width).toFixed(2)); // Rounded to two decimals
  }

  function handleMoveEvent(event) {
    event.preventDefault();
    if (draggings[index]) {
      var position = getPosition(event);
      var currentTime = position * totalDuration;
      updateScrubberPosition(scrubber, position);
      updateMedia(mediaItems, currentTime, index);
    }
  }

  function handleStartEvent(event) {
    draggings[index] = true;
    timeline.classList.add('dragging');

    var position = getPosition(event);
    var currentTime = position * totalDuration;

    updateScrubberPosition(scrubber, position);
    updateMedia(mediaItems, currentTime, index);

    // Update the active media based on the current time
    var cumulativeTime = 0;
    var activeMedia = null;

    mediaItems.forEach(function(item) {
      var duration = parseFloat(item.getAttribute('data-duration'));
      cumulativeTime += duration;

      if (!activeMedia && currentTime < cumulativeTime) {
        activeMedia = item;
      }
    });

    mediaItems.forEach(function(item) {
      if (item === activeMedia) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Play the video from the current time
    var mediaType = activeMedia.getAttribute('data-type');
    var mediaContent = activeMedia.querySelector('video') || activeMedia.querySelector('img');

    if (mediaType === 'video' && mediaContent.paused) {
      var video = mediaContent;
      video.currentTime = currentTime - (cumulativeTime - duration);
      if (activeVideos[index] && activeVideos[index] !== video) {
        pauseActiveVideo(index);
      }
      activeVideos[index] = video;
      video.play();
    }
  }

  function handleEndEvent() {
    if (draggings[index]) {
      draggings[index] = false;
      timeline.classList.remove('dragging');
      pauseActiveVideo(index);
    }
  }

  function handleTouchMove(event) {
    event.preventDefault();
    if (draggings[index]) {
      var position = getPosition(event);
      var currentTime = position * totalDuration;

      updateScrubberPosition(scrubber, position);
      updateMedia(mediaItems, currentTime, index);
    }
  }

  timeline.addEventListener('mousemove', handleMoveEvent);
  timeline.addEventListener('mousedown', handleStartEvent);
  mediaContainer.addEventListener('mouseenter', handleStartEvent);
  window.addEventListener('mouseup', handleEndEvent);

  timeline.addEventListener('touchmove', handleTouchMove, { passive: false });
  timeline.addEventListener('touchstart', handleStartEvent, { passive: false });
  window.addEventListener('touchend', handleEndEvent);
});

function updateScrubberPosition(scrubber, position) {
  scrubber.style.left = (position * 100).toFixed(2) + '%'; // Rounded to two decimals
}

function updateMedia(mediaItems, currentTime, index) {
  var cumulativeTime = 0;
  var activeMedia = null;

  mediaItems.forEach(function(item) {
    var duration = parseFloat(item.getAttribute('data-duration'));
    cumulativeTime += duration;

    if (!activeMedia && currentTime < cumulativeTime) {
      activeMedia = item;
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

function pauseActiveVideo(index) {
  if (activeVideos[index]) {
    activeVideos[index].pause();
    activeVideos[index] = null;
  }
}
