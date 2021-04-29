var swiper = new Swiper(".content-container", {
  slidesPerView: 3,
  spaceBetween: 30,
  freeMode: true,
  navigation: {
    nextEl: '.icon-navigator-left',
    prevEl: '.icon-navigator-right',
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});
