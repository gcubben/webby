//slider.js
// Adapted from https://blog.logrocket.com/build-image-carousel-from-scratch-vanilla-javascript/

class Slider {
	constructor(slider, timer=0) {
		// TODO: Add error handling
		this.slider = slider;
		this.timer = timer;
		this.sliderNode = document.querySelector(slider);
		this.slides = this.sliderNode.querySelectorAll(".slide");
		// loop through slides and set each slides translateX property to index * 100% 
	    this.slides.forEach((slide, indx) => {
	      slide.style.transform = `translateX(${indx * 100}%)`;
	    });
	    this.curSlide = 0;
	    this.maxSlide = this.slides.length - 1;
	    this.nextSlide = this.nextSlide.bind(this);
	    this.prevSlide = this.prevSlide.bind(this);
	    this.autoSlide = this.autoSlide.bind(this);
	    // next/prev Btn
	    this.nextBtn = this.sliderNode.querySelector(".btn-next");
	    this.prevBtn = this.sliderNode.querySelector(".btn-prev");
	    this.nextBtn.addEventListener("click", this.nextSlide);
	    this.prevBtn.addEventListener("click", this.prevSlide);
	    if (this.timer)
	    	this.startAutoSlide();
	}

	autoSlide() {
		// called by a timeout function, advances to next picture if mouse not over slider
		if (!this.sliderNode.matches("div:hover")) {
			this.nextSlide();
		}
	}

	startAutoSlide() {
		if (!this.timerID) {
			this.timerID = setInterval(this.autoSlide, this.timer * 1000);
		}
	}

	stopAutoSlide() {
		if (this.timerID) {
			clearInterval(this.timerID);
			this.timerID = null;
		}
	}

	nextSlide() {
	  // check if current slide is the last and reset current slide
      if (this.curSlide === this.maxSlide) {
        this.curSlide = 0;
      } else {
        this.curSlide++;
      }

      // move slide by -100%
      this.slides.forEach((slide, indx) => {
        slide.style.transform = `translateX(${100 * (indx - this.curSlide)}%)`;
      });
	}

	prevSlide() {
	  // check if current slide is the first and reset current slide to last
      if (this.curSlide === 0) {
        this.curSlide = this.maxSlide;
      } else {
        this.curSlide--;
      }
      // move slide by -100%
      this.slides.forEach((slide, indx) => {
        slide.style.transform = `translateX(${100 * (indx - this.curSlide)}%)`;
      });
	}
};