(() => {
  const canvas = document.querySelector(".particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let animationId = 0;

  function isPhoneViewport() {
    return width <= 768;
  }

  function isLowPowerViewport() {
    return isPhoneViewport() || window.matchMedia("(pointer: coarse)").matches;
  }

  function shouldAnimate() {
    return !prefersReducedMotion.matches && !isLowPowerViewport();
  }

  function randomIn(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, shouldAnimate() ? 2 : 1.25);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle() {
    const phone = isPhoneViewport();
    const radiusMin = phone ? 1.2 : 1.6;
    const radiusMax = phone ? 2.8 : 3.8;
    const speedMin = phone ? -0.28 : -0.33;
    const speedMax = phone ? 0.28 : 0.33;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: randomIn(radiusMin, radiusMax),
      vy: randomIn(speedMin, speedMax),
      vx: randomIn(speedMin, speedMax),
      alpha: randomIn(phone ? 0.18 : 0.28, phone ? 0.46 : 0.78),
      hue: Math.random() > 0.35 ? 195 : 160,
      life: 140 + Math.random() * 280,
      age: Math.random() * 160,
    };
  }

  function resetParticle(p) {
    const phone = isPhoneViewport();
    const radiusMin = phone ? 1.2 : 1.6;
    const radiusMax = phone ? 2.8 : 3.8;
    const speedMin = phone ? -0.28 : -0.33;
    const speedMax = phone ? 0.28 : 0.33;
    p.x = Math.random() * width;
    p.y = Math.random() * height;
    p.r = randomIn(radiusMin, radiusMax);
    p.vy = randomIn(speedMin, speedMax);
    p.vx = randomIn(speedMin, speedMax);
    p.alpha = randomIn(phone ? 0.18 : 0.28, phone ? 0.46 : 0.78);
    p.hue = Math.random() > 0.35 ? 195 : 160;
    p.life = 140 + Math.random() * 280;
    p.age = 0;
  }

  function populate() {
    particles.length = 0;
    const phone = isPhoneViewport();
    const density = shouldAnimate() ? (phone ? 156 : 102) : phone ? 6 : 24;
    for (let i = 0; i < density; i += 1) {
      const p = makeParticle();
      p.age = Math.random() * p.life;
      particles.push(p);
    }
  }

  function drawParticle(p) {
    const lifeRatio = p.age / p.life;
    const fade = lifeRatio < 0.2 ? lifeRatio / 0.2 : Math.max(0, 1 - lifeRatio);
    const alpha = p.alpha * fade;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 95%, 74%, ${alpha})`;
    ctx.shadowColor = `hsla(${p.hue}, 95%, 74%, ${Math.min(alpha * 1.15, 0.9)})`;
    ctx.shadowBlur = shouldAnimate()
      ? p.r * 10
      : isPhoneViewport()
        ? 0
        : p.r * 4;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      if (shouldAnimate()) {
        p.age += 1;
        p.y += p.vy + Math.cos((p.age + i) * 0.03) * 0.12;
        p.x += p.vx + Math.sin((p.age + i) * 0.04) * 0.12;

        if (
          p.age >= p.life ||
          p.y < -24 ||
          p.y > height + 24 ||
          p.x < -24 ||
          p.x > width + 24
        ) {
          resetParticle(p);
        }
      }

      drawParticle(p);
    }

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
  }

  function step() {
    renderFrame();
    animationId = window.requestAnimationFrame(step);
  }

  function restart() {
    window.cancelAnimationFrame(animationId);
    resize();
    populate();
    if (shouldAnimate()) {
      step();
      return;
    }

    renderFrame();
  }

  prefersReducedMotion.addEventListener("change", restart);
  window.addEventListener("resize", restart);

  restart();
})();
