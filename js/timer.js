var seconds = 0;
var timer;
var timerUI = ".timer";

function startTimer() {
	timer = setInterval(update, 1000);
}

function stopTimer() {
	clearTimeout(timer);
}

function clearTimer() {
	seconds = 0;
	$(timerUI).text("000");
}

function update() {
	seconds++;
	if (seconds<10)
		display = "00" + seconds;
	else if (seconds<100)
		display = "0" + seconds;
	else 
		display = seconds;
	$(timerUI).text(display);
}