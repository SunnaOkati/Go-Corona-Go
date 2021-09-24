var slideIndex = 1;

//Changes to next or previous image based on the value of n.
function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

//Displays the current image in the slide and hiding the reset.
function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  var captionText = document.getElementById("caption");

  //Checks if n is greater than 5
  if (n > slides.length) {slideIndex = 1}

  //if n is less than 1, circle it back to last image.
  if (n < 1) {slideIndex = slides.length}

  //Hide all the images.
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }

  //Display the requested image.
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  captionText.innerHTML = dots[slideIndex-1].alt;
}
