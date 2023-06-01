var timeline = document.querySelector('.timeline');
var scrubber = document.querySelector('.scrubber');
var mediaItems = Array.from(document.querySelectorAll('.media'));

var totalDuration = mediaItems.reduce((total, item) => total + parseFloat(item.getAttribute('data-duration')), 0);

timeline.addEventListener('mousemove', function (e) {
    var timelineRect = timeline.getBoundingClientRect();
    var position = (e.clientX - timelineRect.left) / timelineRect.width;

    scrubber.style.left = position * 100 + '%';

    var currentTime = position * totalDuration;
    var currentMedia = findMediaByTime(currentTime);

    mediaItems.forEach(function (item) {
        item.style.opacity = '0';
        if (item.getAttribute('data-type') === 'video') {
            item.querySelector('video').pause();
        }
    });

    if (currentMedia) {
        currentMedia.style.opacity = '1';

        if (currentMedia.getAttribute('data-type') === 'video') {
            var video = currentMedia.querySelector('video');
            video.currentTime = currentTime - cumulativeTime(currentMedia);
            video.play();
        }
    }
});

timeline.addEventListener('mouseleave', function () {
    mediaItems.forEach(function (item) {
        item.style.opacity = '0';
        if (item.getAttribute('data-type') === 'video') {
            item.querySelector('video').pause();
        }
    });
});

function findMediaByTime(time) {
    var cumulativeTime = 0;

    for (var i = 0; i < mediaItems.length; i++) {
        var mediaItem = mediaItems[i];
        var duration = parseFloat(mediaItem.getAttribute('data-duration'));

        if (time >= cumulativeTime && time < cumulativeTime + duration) {
            return mediaItem;
        }

        cumulativeTime += duration;
    }

    return null;
}

function cumulativeTime(mediaItem) {
    var index = mediaItems.indexOf(mediaItem);
    var cumulative = 0;

    for (var i = 0; i < index; i++) {
        cumulative += parseFloat(mediaItems[i].getAttribute('data-duration'));
    }

    return cumulative;
}
