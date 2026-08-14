// Vẽ hoa văn cách điệu lấy cảm hứng từ mặt trống đồng Đông Sơn: mặt trời ở
// giữa, các vành tròn đồng tâm, vành răng cưa và vành chim Lạc cách điệu.
// Được sinh ra bằng JS (không dùng ảnh có sẵn) để giữ file nhẹ và dễ đổi màu
// theo biến CSS (--bronze, --patina, --lacquer).
const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
  return node;
}

(function () {
  function buildDrum(options) {
    const opts = Object.assign(
      {
        rays: 14,
        ringRadii: [34, 46, 58, 70, 82],
        sawRadius: 64,
        sawCount: 30,
        birdCount: 8,
      },
      options
    );

    const svg = el('svg', {
      viewBox: '0 0 200 200',
      xmlns: 'http://www.w3.org/2000/svg',
      'aria-hidden': 'true',
      focusable: 'false',
    });

    const g = el('g', { transform: 'translate(100,100)' });
    svg.appendChild(g);

    // Tia mặt trời trung tâm
    const rayGroup = el('g', {});
    for (let i = 0; i < opts.rays; i += 1) {
      const angle = (360 / opts.rays) * i;
      rayGroup.appendChild(
        el('polygon', {
          points: '0,-6 4,-24 0,-28 -4,-24',
          fill: 'var(--bronze)',
          opacity: '0.9',
          transform: `rotate(${angle})`,
        })
      );
    }
    g.appendChild(rayGroup);

    g.appendChild(el('circle', { r: 6, fill: 'var(--lacquer)' }));

    // Các vành tròn đồng tâm
    opts.ringRadii.forEach((r, idx) => {
      g.appendChild(
        el('circle', {
          r: String(r),
          fill: 'none',
          stroke: idx % 2 === 0 ? 'var(--bronze)' : 'var(--patina)',
          'stroke-width': idx === opts.ringRadii.length - 1 ? '1.4' : '0.8',
        })
      );
    });

    // Vành hoa văn răng cưa
    const sawGroup = el('g', {});
    for (let i = 0; i < opts.sawCount; i += 1) {
      const angle = (360 / opts.sawCount) * i;
      sawGroup.appendChild(
        el('polygon', {
          points: `0,${opts.sawRadius - 4} 3,${opts.sawRadius + 4} -3,${opts.sawRadius + 4}`,
          fill: 'var(--patina)',
          opacity: '0.75',
          transform: `rotate(${angle})`,
        })
      );
    }
    g.appendChild(sawGroup);

    // Vành chim Lạc cách điệu
    const birdRadius = opts.ringRadii[opts.ringRadii.length - 2];
    const birdGroup = el('g', {});
    for (let i = 0; i < opts.birdCount; i += 1) {
      const angle = (360 / opts.birdCount) * i;
      birdGroup.appendChild(
        el('path', {
          d: 'M -6,0 Q 0,-6 6,0 Q 0,3 -6,0',
          fill: 'var(--bronze)',
          opacity: '0.6',
          transform: `rotate(${angle}) translate(0, ${-birdRadius})`,
        })
      );
    }
    g.appendChild(birdGroup);

    return svg;
  }

  window.mountTrongDong = function mount(id, options) {
    const host = document.getElementById(id);
    if (!host) return;
    host.appendChild(buildDrum(options));
  };
}());


// Nhóm chim Lạc cách điệu dùng như điểm nhấn trang trí. Đây là SVG nội tuyến,
// không phụ thuộc ảnh bên ngoài nên vẫn nhẹ và đổi màu theo theme đồng.
window.mountBirdFlock = function mountBirdFlock(id, options) {
  const host = document.getElementById(id);
  if (!host) return;
  const opts = Object.assign({ count: 4 }, options);
  const svg = el('svg', {
    viewBox: '0 0 160 90',
    xmlns: SVG_NS,
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const g = el('g', { fill: 'var(--bronze-dark)' });
  const positions = [
    [28, 42, 1.0, -5],
    [67, 25, 0.72, 2],
    [103, 46, 0.88, -3],
    [136, 29, 0.58, 4],
  ];
  positions.slice(0, opts.count).forEach(([x, y, scale, rotate]) => {
    const bird = el('g', {
      transform: `translate(${x} ${y}) scale(${scale}) rotate(${rotate})`,
      opacity: '0.92',
    });
    bird.appendChild(el('path', {
      d: 'M -18,1 Q -9,-8 0,0 Q 9,-8 18,1 Q 8,0 2,5 L 0,11 L -2,5 Q -8,0 -18,1 Z',
    }));
    bird.appendChild(el('path', {
      d: 'M 1,4 Q 7,7 12,5 L 19,7 L 12,10 Q 6,9 1,7 Z',
    }));
    g.appendChild(bird);
  });
  svg.appendChild(g);
  host.appendChild(svg);
};
