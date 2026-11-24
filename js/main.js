
document.addEventListener("DOMContentLoaded", function () {

  /* =========================
   SLIDER DRAG / SWIPE
========================= */

  function enableSliderDrag(element, onNext, onPrev, getAxis) {
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let dragging = false;
    let preventClick = false;
    let pointerId = null;

    element.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });

    element.addEventListener("pointerdown", function (event) {
      if (!event.isPrimary || event.button !== 0) return;

      startX = event.clientX;
      startY = event.clientY;
      pointerId = event.pointerId;
      dragging = true;
      preventClick = false;

      element.classList.add("is-dragging");
    });

    window.addEventListener("pointerup", function (event) {
      if (!dragging || event.pointerId !== pointerId) return;

      dragging = false;
      element.classList.remove("is-dragging");

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      const axis = getAxis();
      const distance = axis === "y" ? dy : dx;
      const crossDistance = axis === "y" ? dx : dy;

      if (
        Math.abs(distance) < 40 ||
        Math.abs(distance) < Math.abs(crossDistance)
      ) return;

      preventClick = true;

      if (axis === "y") {
        distance > 0 ? onNext() : onPrev();
      } else {
        distance < 0 ? onNext() : onPrev();
      }

      setTimeout(function () {
        preventClick = false;
      }, 0);
    });

    window.addEventListener("pointercancel", function () {
      dragging = false;
      element.classList.remove("is-dragging");
    });

    element.addEventListener("click", function (event) {
      if (preventClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

  /* =========================
     PC 전체 메뉴
  ========================= */

  const desktopNav = document.querySelector(".desktop-nav");
  const megaMenu = document.querySelector(".mega-menu");
  const navLinks = document.querySelectorAll(".nav-list a");
  const header = document.querySelector(".site-header");
  const megaOverlay = document.querySelector(".mega-overlay");

  // 메가메뉴 열기
  function openMegaMenu(activeLink) {
    megaMenu.classList.add("open");

    // 배경 오버레이 표시
    if (megaOverlay) {
      megaOverlay.classList.add("active");
    }

    navLinks.forEach(link => {
      link.classList.toggle("active", link === activeLink);
    });
  }

  // 메가메뉴 닫기
  function closeMegaMenu() {
    megaMenu.classList.remove("open");

    // 배경 오버레이 숨기기
    if (megaOverlay) {
      megaOverlay.classList.remove("active");
    }

    navLinks.forEach(link => {
      link.classList.remove("active");
    });
  }

  // 메뉴 마우스 오버 및 키보드 포커스
  navLinks.forEach(link => {
    link.addEventListener("mouseenter", function () {
      openMegaMenu(link);
    });

    link.addEventListener("focus", function () {
      openMegaMenu(link);
    });
  });

  // 헤더에서 마우스가 벗어나면 닫기
  header.addEventListener("mouseleave", closeMegaMenu);

  // ESC 키로 닫기
  header.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMegaMenu();
  });

  // 헤더 밖으로 키보드 포커스가 이동하면 닫기
  header.addEventListener("focusout", function (event) {
    if (!header.contains(event.relatedTarget)) {
      closeMegaMenu();
    }
  });


  /* =========================
     모바일 메뉴 열기 / 닫기
  ========================= */

  const menuButton = document.querySelector(".mobile-menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");
  const overlay = document.querySelector(".mobile-menu-overlay");
  const closeButton = document.querySelector(".mobile-close-btn");

  function openMobileMenu() {
    mobileMenu.classList.add("open");
    overlay.classList.add("open");
    document.body.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded", "true");
    closeButton.focus();
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("open");
    overlay.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }

  menuButton.addEventListener("click", function () {
    if (mobileMenu.classList.contains("open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
  closeButton.addEventListener("click", closeMobileMenu);
  overlay.addEventListener("click", closeMobileMenu);

  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      mobileMenu.classList.contains("open")
    ) {
      closeMobileMenu();
    }
  });


  /* =========================
     모바일 아코디언 메뉴
  ========================= */

  const menuGroups = document.querySelectorAll(".mobile-nav-group");

  menuGroups.forEach(group => {
    const title = group.querySelector(".mobile-nav-title");
    const subLinks = group.querySelectorAll(".mobile-submenu a");

    title.addEventListener("click", function () {
      const wasActive = group.classList.contains("active");

      menuGroups.forEach(item => {
        item.classList.remove("active");

        item.querySelector(".mobile-nav-title")
          .setAttribute("aria-expanded", "false");
      });

      if (!wasActive) {
        group.classList.add("active");
        title.setAttribute("aria-expanded", "true");
      }
    });

    subLinks.forEach(link => {
      link.addEventListener("click", function () {
        document.querySelectorAll(".mobile-submenu a")
          .forEach(item => item.classList.remove("selected"));

        link.classList.add("selected");
      });
    });
  });


  /* PC 크기로 전환하면 모바일 메뉴 닫기 */

  window.addEventListener("resize", function () {
    if (
      window.innerWidth > 768 &&
      mobileMenu.classList.contains("open")
    ) {
      closeMobileMenu();
    }
  });


  /* =========================
     MAIN HERO SLIDER
  ========================= */

  const slider = document.querySelector("#heroSlider");
  const pagination = document.querySelector("#heroPagination");

  if (!slider || !pagination) return;

  const slides = [...slider.querySelectorAll(".hero-slide")];

  if (!slides.length) return;

  let currentIndex = 0;
  let timer = null;

  /* 페이지 버튼 자동 생성 */

  pagination.innerHTML = "";

  slides.forEach((_, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "hero-dot";
    dot.setAttribute("aria-label", `${index + 1}번째 배너`);

    dot.addEventListener("click", () => {
      showSlide(index);
      startAutoSlide();
    });

    pagination.appendChild(dot);
  });

  const dots = [...pagination.querySelectorAll(".hero-dot")];


  /* 슬라이드 전환 */

  let isHeroAnimating = false;

  function showSlide(nextIndex) {
    if (isHeroAnimating) return;

    const direction = nextIndex < currentIndex ? -1 : 1;

    nextIndex = (nextIndex + slides.length) % slides.length;

    if (nextIndex === currentIndex) return;

    isHeroAnimating = true;

    const currentSlide = slides[currentIndex];
    const nextSlide = slides[nextIndex];

    const isMobile = window.innerWidth <= 768;
    const axis = isMobile ? "X" : "Y";
    const offset = (isMobile ? 100 : -100) * direction;

    // 모든 배너의 전환 효과 잠시 해제
    slides.forEach(slide => {
      slide.style.transition = "none";
      slide.style.zIndex = "0";
      slide.style.visibility = "hidden";
      slide.classList.remove("active", "prev");
    });

    // 현재 배너 위치 고정
    currentSlide.style.visibility = "visible";
    currentSlide.style.transform = `translate${axis}(0%)`;
    currentSlide.style.zIndex = "1";

    // 다음 배너를 화면 바로 바깥에 배치
    nextSlide.style.visibility = "visible";
    nextSlide.style.transform = `translate${axis}(${offset}%)`;
    nextSlide.style.zIndex = "2";

    // 시작 위치를 브라우저에 반영
    void nextSlide.offsetWidth;

    // 두 배너를 동일한 속도로 이동
    currentSlide.style.transition = "transform .7s ease";
    nextSlide.style.transition = "transform .7s ease";

    currentSlide.style.transform = `translate${axis}(${-offset}%)`;
    nextSlide.style.transform = `translate${axis}(0%)`;

    currentIndex = nextIndex;
    updateDots();

    // 전환 완료 후 초기화
    setTimeout(function () {
      slides.forEach((slide, index) => {
        slide.style.transition = "none";
        slide.style.transform = "";
        slide.style.zIndex = "";
        slide.style.visibility = "";
        slide.classList.toggle("active", index === currentIndex);
      });

      void nextSlide.offsetWidth;

      slides.forEach(slide => {
        slide.style.transition = "";
      });

      isHeroAnimating = false;
    }, 750);
  }

  // 메인 배너 드래그 및 스와이프
  enableSliderDrag(
    slider,
    function () {
      showSlide(currentIndex + 1);
      startAutoSlide();
    },
    function () {
      showSlide(currentIndex - 1);
      startAutoSlide();
    },
    function () {
      return window.innerWidth <= 768 ? "x" : "y";
    }
  );


  /* 페이지 버튼 상태 변경 */

  function updateDots() {
    dots.forEach((dot, index) => {
      const active = index === currentIndex;

      dot.classList.toggle("active", active);

      if (active) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }


  /* 4초마다 자동 전환 */

  function startAutoSlide() {
    clearInterval(timer);

    if (slides.length < 2) return;

    timer = setInterval(() => {
      showSlide(currentIndex + 1);
    }, 4000);
  }



  /* 초기 상태 설정 */

  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === 0);
    slide.classList.remove("prev");
  });

  updateDots();
  startAutoSlide();



  /* =========================
     RECOMMEND SLIDER
  ========================= */

  const recommendViewport = document.querySelector(".recommend-viewport");
  const recommendTrack = document.querySelector(
    ".recommend-viewport > .recommend-track"
  );
  const recommendCards = recommendTrack
    ? [...recommendTrack.querySelectorAll(".recommend-card")]
    : [];
  const recommendPrev = document.querySelector(".recommend-prev");
  const recommendNext = document.querySelector(".recommend-next");

  if (
    recommendViewport &&
    recommendTrack &&
    recommendCards.length &&
    recommendPrev &&
    recommendNext
  ) {
    let recommendIndex = 0;

    function updateRecommendSlider() {

      // 화면에 실제로 표시할 카드 수
      const visibleCount = window.innerWidth <= 768 ? 2 : 4;
      const maxIndex = Math.max(0, recommendCards.length - visibleCount);

      // 이동 범위 제한
      recommendIndex = Math.max(0, Math.min(recommendIndex, maxIndex));

      // 실제 카드 위치를 기준으로 이동 거리 계산
      const moveX =
        recommendCards[recommendIndex].offsetLeft -
        recommendCards[0].offsetLeft;

      recommendTrack.style.transform = `translate3d(-${moveX}px, 0, 0)`;
    }

    // 자동 슬라이드 간격 (4초)
    const recommendInterval = 4000;
    let recommendTimer;

    // 다음 카드로 한 칸 이동
    function moveRecommendNext() {
      const visibleCount = window.innerWidth <= 768 ? 2 : 4;
      const maxIndex = Math.max(0, recommendCards.length - visibleCount);

      // 마지막 위치에 도달하면 처음으로 돌아가기
      recommendIndex = recommendIndex >= maxIndex ? 0 : recommendIndex + 1;

      updateRecommendSlider();
    }

    // 자동 슬라이드 시작
    function startRecommendAuto() {
      clearInterval(recommendTimer);

      recommendTimer = setInterval(function () {
        moveRecommendNext();
      }, recommendInterval);
    }

    // 자동 슬라이드 재시작
    function resetRecommendAuto() {
      startRecommendAuto();
    }

    // 이전 버튼
    recommendPrev.addEventListener("click", function () {
      const visibleCount = window.innerWidth <= 768 ? 2 : 4;
      const maxIndex = Math.max(0, recommendCards.length - visibleCount);

      recommendIndex = recommendIndex <= 0 ? maxIndex : recommendIndex - 1;

      updateRecommendSlider();
      resetRecommendAuto();
    });

    // 다음 버튼
    recommendNext.addEventListener("click", function () {
      moveRecommendNext();
      resetRecommendAuto();
    });

    // 화면 크기 변경
    window.addEventListener("resize", function () {
      recommendIndex = 0;
      updateRecommendSlider();
      resetRecommendAuto();
    });

    // 마우스를 올리면 자동 슬라이드 일시정지
    recommendViewport.addEventListener("mouseenter", function () {
      clearInterval(recommendTimer);
    });

    // 마우스를 떼면 자동 슬라이드 재시작
    recommendViewport.addEventListener("mouseleave", function () {
      startRecommendAuto();
    });

    // 초기 실행
    updateRecommendSlider();
    startRecommendAuto();

    // 추천시설 드래그 및 스와이프
    enableSliderDrag(
      recommendViewport,
      function () {
        recommendNext.click();
      },
      function () {
        recommendPrev.click();
      },
      function () {
        return "x";
      }
    );
  }

  /* =========================
 INVITE SHARE
========================= */

  // 개발팀 연동 필요
  // 로그인 회원별 친구추천 전용 URL 생성
  // 카카오톡 친구추천 링크 공유 기능 연동
  // 인스타그램 공유 방식 확인
  // 링크 복사 시 회원별 친구추천 URL 복사

  const inviteUrl = "https://www.ikozen.com/";

  const kakaoShareButton = document.querySelector(".benefit-share-kakao");
  const instaShareButton = document.querySelector(".benefit-share-insta");
  const copyShareButton = document.querySelector(".benefit-share-copy");

  // 카카오톡 버튼 (임시 연결)
  if (kakaoShareButton) {
    kakaoShareButton.addEventListener("click", function () {
      window.open(
        "https://pf.kakao.com/_jHynxd",
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  // 인스타그램 버튼
  if (instaShareButton) {
    instaShareButton.addEventListener("click", function () {
      window.open(
        "https://www.instagram.com/ikozen.since2005?igshid=MjEwN2IyYWYwYw%3D%3D",
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  // 링크 복사
  if (copyShareButton) {
    copyShareButton.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(inviteUrl);

        const originalText = copyShareButton.textContent;
        copyShareButton.textContent = "복사 완료!";

        setTimeout(function () {
          copyShareButton.textContent = originalText;
        }, 2000);

      } catch (error) {
        alert("링크 복사에 실패했습니다. 다시 시도해 주세요.");
      }
    });
  }

  /* =========================
     EXTRA BENEFIT SLIDER
  ========================= */

  const extraViewport = document.querySelector(".extra-benefit-viewport");
  const extraTrack = document.querySelector(".extra-benefit-track");
  const extraSlides = [
    ...document.querySelectorAll(".extra-benefit-slide")
  ];

  if (extraViewport && extraTrack && extraSlides.length) {

    let extraIndex = 0;
    let extraTimer;

    const extraInterval = 4000;

    // 슬라이드 이동
    function updateExtraSlider() {
      extraTrack.style.transform =
        `translate3d(-${extraIndex * 100}%, 0, 0)`;
    }

    // 다음 슬라이드로 이동
    function moveExtraNext() {
      extraIndex = (extraIndex + 1) % extraSlides.length;
      updateExtraSlider();
    }

    // 자동 슬라이드 시작
    function startExtraAuto() {
      clearInterval(extraTimer);

      extraTimer = setInterval(function () {
        moveExtraNext();
      }, extraInterval);
    }

    // 마우스를 올리면 일시정지
    extraViewport.addEventListener("mouseenter", function () {
      clearInterval(extraTimer);
    });

    // 마우스를 떼면 다시 시작
    extraViewport.addEventListener("mouseleave", function () {
      startExtraAuto();
    });

    // 화면 크기 변경 시 위치 유지
    window.addEventListener("resize", updateExtraSlider);

    updateExtraSlider();
    startExtraAuto();

    // 추가 혜택 드래그 및 스와이프
    enableSliderDrag(
      extraViewport,
      function () {
        moveExtraNext();
        startExtraAuto();
      },
      function () {
        extraIndex =
          (extraIndex - 1 + extraSlides.length)
          % extraSlides.length;

        updateExtraSlider();
        startExtraAuto();
      },
      function () {
        return "x";
      }
    );
  }

  /* =========================
   FLOATING QUICK MENU
========================= */

  const floatingItems = document.querySelectorAll(".floating-item");
  const floatingTop = document.querySelector(".floating-top");

  const floatingLinks = {
    kakao: "https://pf.kakao.com/_jHynxd",
    inquiry: "https://ikozen.com/board/qna_list.html"
  };

  // 모든 팝업 닫기
  function closeFloatingPopups() {
    floatingItems.forEach(item => {
      item.querySelector(".floating-popup")?.classList.remove("active");
      item.querySelector(".floating-icon")?.setAttribute("aria-expanded", "false");
    });
  }

  // 상담 아이콘 클릭
  floatingItems.forEach(item => {
    const button = item.querySelector(".floating-icon");
    const popup = item.querySelector(".floating-popup");

    if (!button || !popup) return;

    button.addEventListener("click", function () {
      const type = button.dataset.floating;

      // 모바일에서는 상담 페이지로 바로 이동
      if (window.innerWidth <= 768) {
        window.location.href = floatingLinks[type];
        return;
      }

      // PC에서는 팝업 열기 / 닫기
      const wasOpen = popup.classList.contains("active");

      closeFloatingPopups();

      if (!wasOpen) {
        popup.classList.add("active");
        button.setAttribute("aria-expanded", "true");
      }
    });

    // 팝업 닫기 버튼
    popup.querySelector(".floating-popup-close")?.addEventListener("click", function () {
      closeFloatingPopups();
    });
  });

  // 팝업 바깥 클릭 시 닫기
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".floating-item")) {
      closeFloatingPopups();
    }
  });

  // ESC 키로 팝업 닫기
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeFloatingPopups();
    }
  });

  // TOP 버튼
  if (floatingTop) {
    floatingTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }


  /* =========================
   MOBILE MEMBERSHIP CARD CLICK
========================= */

  document.querySelectorAll(".membership-card").forEach(card => {
    card.addEventListener("click", function (event) {

      // PC에서는 기존 버튼만 클릭 가능
      if (window.innerWidth > 768) return;

      // 기존 링크를 직접 클릭한 경우 중복 실행 방지
      if (event.target.closest("a")) return;

      // 카드에 연결된 기존 링크로 이동
      const link = card.querySelector(".membership-detail");

      if (link) {
        window.location.href = link.href;
      }

    });
  });
});
