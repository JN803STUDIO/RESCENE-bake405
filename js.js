var m = 5000;
var P = 2500;

var B = [
  { n: "원이의 옥수수 크림빵", img: "img/woni.jpg", p: "img/bread/woni.png" },
  { n: "제나의 딸기잼 샌드",   img: "img/zena.jpg", p: "img/bread/zena.png" },
  { n: "메이의 시나몬롤",      img: "img/may.jpg", p: "img/bread/may.png" },
  { n: "미나미의 메론빵",      img: "img/minami.jpg", p: "img/bread/minami.png" },
  { n: "리브의 초코 호떡",     img: "img/liv.jpg", p: "img/bread/liv.png" }
];
var S = ["동탄센트럴점", "반송중앙점", "영통역점", "수원시청점", "망포역점", "동탄호수공원점"];

var st = [];
var inv = [];
var bi = 0;
var C = [];
var ps = -1;
var pk = [];
var od = false;
var rf = false;
var tot = 0;
var sec = 0;
var tm;
var dbg = false;
var sBread = 0;
var sCard = 0;
var sSpent = 0;
var sTry = 0;
var sOk = 0;
var sFail = 0;
var oc = 0;

for (var i = 1; i <= 7; i++) {
  C.push({ n: "SECRET " + i, mb: "RARE", img: "img/cards/rare" + i + ".jpg", c: 0 });
}
var mn = ["원이", "미나미", "리브", "메이", "제나"];
var mf = ["woni", "minami", "liv", "may", "zena"];
for (var i = 0; i < 5; i++) {
  for (var j = 1; j <= 4; j++) {
    C.push({ n: mn[i] + " " + j, mb: mn[i], img: "img/cards/" + mf[i] + j + ".jpg", c: 0 });
  }
}

function h(id, t) {
  document.getElementById(id).innerHTML = t;
}

function won(n) {
  var s = String(n);
  var r = "";
  for (var i = s.length - 1; i >= 0; i--) {
    r = s.charAt(i) + r;
    if ((s.length - i) % 3 === 0 && i > 0) r = "," + r;
  }
  return r + "원";
}

function add(n) {
  m += n;
  if (dbg) h("money", "무제한");
  else h("money", won(m));
}

function names() {
  var a = [];
  for (var s = 0; s < pk.length; s++) {
    if (!pk[s]) continue;
    for (var j = 0; j < pk[s].length; j++) {
      if (pk[s][j]) a.push(B[st[s][j]].n);
    }
  }
  return a;
}

function mk() {
  st = [];
  ps = -1;
  pk = [];
  var cnt = 0;
  for (var i = 0; i < 6; i++) st.push([]);

  if (dbg || Math.random() < 0.25) {
    var e = Math.floor(Math.random() * 6);
    var s = e;
    while (s === e) s = Math.floor(Math.random() * 6);

    for (var i = 0; i < 6; i++) {
      if (!dbg && i === e) continue;
      if (!dbg && i !== s && Math.random() < 0.5) continue;
      var a = Math.floor(Math.random() * 4) + 1;
      if (dbg || Math.random() < 0.0001) a = 5;
      var bag = [0, 1, 2, 3, 4];
      for (var k = 0; k < a; k++) {
        var r = Math.floor(Math.random() * bag.length);
        st[i].push(bag[r]);
        bag.splice(r, 1);
      }
      cnt++;
    }
  }

  dS();
  if (cnt === 0) h("orderText", "모든 지점에 재고가 없습니다.");
  else h("orderText", cnt + "개 지점에 재고가 있습니다. 제품을 선택하고 주문하기를 누르세요.");
}

function refresh() {
  if (od || rf) return;
  if (dbg) return mk();
  rf = true;
  document.getElementById("storeList").className = "loading";
  h("orderText", "재고 확인 중...");
  dS();
  tm = setInterval(endRf, 1000 + Math.floor(Math.random() * 1001));
}

function endRf() {
  clearInterval(tm);
  rf = false;
  document.getElementById("storeList").className = "";
  mk();
}

function dS() {
  var t = "";
  for (var i = 0; i < 6; i++) {
    var lk = false;
    if (!dbg && ps !== -1 && ps !== i) lk = true;

    var c = "store";
    if (lk) c += " locked";
    t += '<div class="' + c + '"><h3>CU ' + S[i] + '</h3>';
    if (st[i].length === 0) t += '<p class="empty">재고 없음</p>';

    t += '<div class="products">';
    for (var j = 0; j < st[i].length; j++) {
      var b = B[st[i][j]];
      c = "product";
      if (pk[i] && pk[i][j]) c += " selected";
      var d = "";
      if (od || lk) d = " disabled";
      t += '<button class="' + c + '" onclick="pick(' + i + ',' + j + ')"' + d + '>';
      t += '<img src="' + b.img + '"><div><b>' + b.n + '</b>' + won(P) + '</div></button>';
    }
    t += '</div></div>';
  }
  h("storeList", t);

  var n = names().length;
  var ob = document.getElementById("orderButton");
  ob.innerText = "주문하기";
  if (n > 0) ob.innerText += " (" + n + "개 · " + won(n * P) + ")";
  ob.disabled = false;
  if (n === 0 || rf) ob.disabled = true;
  ob.classList.toggle("cancel", od);
  if (od) {
    ob.innerText = "주문 취소";
    ob.disabled = false;
  }
  dStat();
}

function pick(s, j) {
  if (od || rf) return;
  if (!dbg && ps !== -1 && ps !== s) return;
  if (!pk[s]) pk[s] = [];
  pk[s][j] = !pk[s][j];
  ps = s;
  if (names().length === 0) ps = -1;
  dS();
}

function order() {
  if (od) return cancelOrder();
  if (rf) return;
  var n = names().length;
  if (n === 0) {
    h("orderText", "주문할 제품을 선택하세요.");
    return;
  }
  tot = n * P;
  if (dbg) tot = 0;
  if (m < tot) {
    h("orderText", "주문 실패. 잔액 부족");
    return;
  }
  od = true;
  oc = n;
  sTry++;
  add(-tot);
  dS();
  sec = Math.floor(Math.random() * 11) + 11;
  if (dbg) sec = 1;
  cd();
  if (od) tm = setInterval(cd, 1000);
}

function cd() {
  sec--;
  var nm = names().join(", ");
  if (sec > 0) {
    h("orderText", nm + " 주문 처리 중... (" + sec + "초)");
    return;
  }
  clearInterval(tm);

  if (dbg || Math.random() < 0.45) {
    for (var s = 0; s < pk.length; s++) {
      if (!pk[s]) continue;
      var left = [];
      for (var j = 0; j < st[s].length; j++) {
        if (pk[s][j]) inv.push(st[s][j]);
        else left.push(st[s][j]);
      }
      st[s] = left;
    }
    sOk++;
    sBread += oc;
    sSpent += oc * P;
    h("orderText", "주문 성공! " + nm + " → 인벤토리에 추가되었습니다.");
    dI();
  } else {
    sFail++;
    add(tot);
    h("orderText", "주문 실패. 결제 금액 " + won(tot) + "이 환불되었습니다.");
  }
  od = false;
  ps = -1;
  pk = [];
  dS();
}

function dI() {
  var t = "";
  for (var i = 0; i < inv.length; i++) {
    var c = "item";
    if (i === bi) c += " selected";
    t += '<div class="' + c + '"><span>' + B[inv[i]].n + '</span>';
    t += '<button class="pink" onclick="bi=' + i + '; dI()">선택</button></div>';
  }
  var bag = document.getElementById("bag");
  if (inv.length === 0) {
    t = "가진 빵이 없습니다.";
    bag.className = "bag";
    bag.innerHTML = "<div><small>RESCENE × BAKE405</small>RESCENE<br>BREAD</div>";
  } else {
    bag.className = "bag pic";
    bag.innerHTML = '<img src="' + B[inv[bi]].img + '">';
  }
  h("inventoryList", t);
}

const TW = 360;
const TH = 560;
const T = document.getElementById("table");
const stageEl = document.getElementById("stage");
const closeBtn = document.getElementById("stageClose");
const gdBtn = document.getElementById("stageGd");
let gdDef = true;
let sc = 1;
let busy = false;

const px = n => n + "px";
const wait = ms => new Promise(r => setTimeout(r, ms));

function el(parent, cls, css, html) {
  const e = document.createElement("div");
  e.className = cls;
  Object.assign(e.style, css);
  if (html) e.innerHTML = html;
  parent.appendChild(e);
  return e;
}

function guide(par, x, y, a) {
  return el(par, "gd", { left: px(x), top: px(y) }, `<i></i><b style="transform:rotate(${a}deg)"></b>`);
}

function fit() {
  sc = Math.min(1.7, (innerWidth - 40) / TW, (innerHeight - 60) / TH);
  T.style.transform = `scale(${sc})`;
  T.parentElement.style.width = px(TW * sc);
  T.parentElement.style.height = px(TH * sc);
}
addEventListener("resize", () => {
  if (busy) fit();
});

function edge(W, y) {
  return [[0, y], [W, y]];
}
const pts = a => a.map(q => px(q[0]) + " " + px(q[1])).join(",");
const clipBody = (W, H, y) => `polygon(${pts(edge(W, y))}, ${px(W)} ${px(H)}, 0 ${px(H)})`;

function drag(e0, down, move, up) {
  let sx = null;
  let sy = 0;
  e0.style.touchAction = "none";
  e0.onpointerdown = e => {
    sx = e.clientX;
    sy = e.clientY;
    try {
      e0.setPointerCapture(e.pointerId);
    } catch (err) {}
    e0.style.transition = "none";
    down();
  };
  e0.onpointermove = e => {
    if (sx === null) return;
    const r = T.getBoundingClientRect();
    move((e.clientX - sx) / sc, (e.clientY - sy) / sc, (e.clientX - r.left) / sc, (e.clientY - r.top) / sc);
  };
  e0.onpointerup = e0.onpointercancel = () => {
    if (sx === null) return;
    sx = null;
    up();
  };
}

function stopDrag(e0) {
  e0.onpointerdown = e0.onpointermove = e0.onpointerup = e0.onpointercancel = null;
}

const deg = r => r * 180 / Math.PI;
const norm = a => {
  while (a > 180) a -= 360;
  while (a <= -180) a += 360;
  return a;
};

function wrap(a, lo) {
  while (a < lo) a += 360;
  while (a >= lo + 360) a -= 360;
  return a;
}

function spring(o, draw) {
  let run = false;
  function step() {
    if (o.dead) {
      run = false;
      return;
    }
    const k = o.hold ? 0.09 : 0.02;
    const d = o.hold ? 0.62 : 0.86;
    o.v = (o.v + (o.tgt - o.th) * k) * d;
    o.th += o.v;
    o.p += (o.pt - o.p) * 0.18;
    draw();
    if (o.hold || Math.abs(o.v) > 0.02 || Math.abs(o.tgt - o.th) > 0.05 || Math.abs(o.pt - o.p) > 0.001) requestAnimationFrame(step);
    else run = false;
  }
  return () => {
    if (run) return;
    run = true;
    requestAnimationFrame(step);
  };
}

function bend(i, tf, N, o) {
  const d = i + 1 - tf;
  if (d <= 0) return 0;
  const u = Math.min(d / Math.max(N - tf, 1), 1);
  const a = Math.min(d, 1);
  const wob = Math.max(-25, Math.min(25, -o.v * 3));
  return a * (o.th * (1 - (1 - u) * (1 - u)) + wob * u * u);
}

function tear(grp, W, y) {
  const N = 12;
  const sw = W / N;
  const parts = [];
  for (let i = 0; i < N; i++) {
    parts.push(el(grp, "pslice", {
      left: px(W - (i + 1) * sw), top: "0px", width: px(sw + 0.6), height: px(y),
      transformOrigin: "100% 100%"
    }));
  }
  const o = { th: 0, v: 0, tgt: 0, hold: false, p: 0, pt: 0 };

  function draw() {
    const p = o.p;
    const tf = N * (1 - p);
    let hx = 0;
    let hy = 0;
    for (let i = 0; i < N; i++) {
      const cum = p > 0 ? bend(i, tf, N, o) : 0;
      const r = cum * Math.PI / 180;
      const shade = Math.abs(Math.sin(r / 2)) * 0.3;
      parts[i].style.transform = `translate(${hx}px, ${hy}px) rotate(${cum}deg)`;
      parts[i].style.background = `linear-gradient(rgba(0,0,0,${shade}), rgba(255,255,255,${shade})), #fbf8f5`;
      hx += sw - sw * Math.cos(r);
      hy -= sw * Math.sin(r);
    }
  }
  draw();
  const kick = spring(o, draw);

  return done => {
    const gx = parseFloat(grp.style.left);
    const gy = parseFloat(grp.style.top);
    let fin = false;
    for (const s of parts) {
      drag(s, () => {
        o.hold = true;
        kick();
      }, (dx, dy, tx, ty) => {
        const lx = tx - gx;
        const ly = ty - gy;
        o.pt = Math.max(o.pt, Math.min(0.9, lx / W));
        o.tgt = wrap(deg(Math.atan2(ly - (y + 14), lx - W * o.pt)) - 180, -40);
        kick();
        if (fin || o.pt < 0.4) return;
        fin = true;
        for (const q of parts) q.style.zIndex = 0;
        done();
      }, () => {
        o.hold = false;
        o.tgt = 25;
        kick();
      });
    }
  };
}

function curl(L, top, W, H, sx, img, body, done) {
  const N = 16;
  const sh = H / N;
  const parts = [];
  for (let i = 0; i < N; i++) {
    parts.push(el(T, "slice", {
      left: px(L + W - sx), top: px(top + (N - 1 - i) * sh), width: px(sx), height: px(sh + 0.6),
      transformOrigin: "0 100%",
      backgroundSize: `${px(W)} auto, ${px(W)} auto`
    }));
  }
  const o = { th: 0, v: 0, tgt: 0, hold: false, p: 0, pt: 0 };

  function draw() {
    const p = o.p;
    const tf = N * (1 - p);
    let hx = 0;
    let hy = 0;
    for (let i = 0; i < N; i++) {
      const cum = p > 0 ? bend(i, tf, N, o) : 0;
      const r = cum * Math.PI / 180;
      const shade = Math.abs(Math.sin(r / 2)) * 0.3;
      const sheen = Math.max(0, Math.sin(r * 2)) * 0.3;
      parts[i].style.transform = `translate(${hx}px, ${hy}px) rotate(${cum}deg)`;
      parts[i].style.backgroundImage = `linear-gradient(90deg, rgba(255,255,255,${sheen}), rgba(0,0,0,${shade})), url(${img})`;
      parts[i].style.backgroundPosition = `${sx - W}px ${-(N - 1 - i) * sh}px, ${sx - W}px ${-(N - 1 - i) * sh}px`;
      hx += sh * Math.sin(r);
      hy += sh - sh * Math.cos(r);
    }
    body.style.transform = `rotate(${-p * 1.2}deg)`;
  }
  draw();
  const kick = spring(o, draw);
  parts.stop = () => {
    o.dead = true;
  };

  let fin = false;
  for (const s of parts) {
    drag(s, () => {
      body.style.transition = "none";
      o.hold = true;
      kick();
    }, (dx, dy, tx, ty) => {
      o.pt = Math.max(o.pt, Math.min(0.9, (ty - top) / H));
      o.tgt = wrap(deg(Math.atan2(ty - (top + H * o.pt), tx - (L + W - sx - 14))) + 90, -40);
      kick();
      if (fin || o.pt < 0.4) return;
      fin = true;
      done();
    }, () => {
      o.hold = false;
      o.tgt = fin ? 60 : 170;
      kick();
    });
  }
  return parts;
}

function opn() {
  if (busy) return;
  if (inv.length === 0) {
    h("resultTitle", "빵이 없습니다");
    h("resultText", "편의점 재고에서 빵을 주문하세요.");
    return;
  }
  busy = true;
  const bn = inv[bi];
  const card = C[Math.floor(Math.random() * C.length)];
  const im = new Image();
  im.onload = () => openBag(bn, card, im.naturalWidth, im.naturalHeight);
  im.src = B[bn].img;
}

function setGd(on) {
  stageEl.classList.toggle("nogd", !on);
  gdBtn.innerText = "가이드 " + (on ? "ON" : "OFF");
  gdBtn.classList.toggle("off", !on);
}

function stageGd() {
  setGd(stageEl.classList.contains("nogd"));
}

function closeStage() {
  setGd(gdDef);
  stageEl.classList.add("hidden");
  T.innerHTML = "";
  busy = false;
}

const BS = [[165, 276, 92], [165, 276, 92], [160, 167], [160, 170], [160, 161]];
const LAND = 330;

function breadEl(bn, x, y) {
  const [bw, bh, iw] = BS[bn];
  let html = `<img class="bimg" src="${B[bn].p}">`;
  let cls = "pbread";
  if (bn < 2) {
    html = `<img class="timg" src="img/bread/tray.png"><img class="bimg" src="${B[bn].p}" style="width:${iw}px">`;
    cls += " ontray";
  }
  if (bn === 2) html += '<div class="film"></div>';
  return el(T, cls, { left: px(x), top: px(y), width: px(bw), height: px(bh) }, html);
}

function toss(e0, done) {
  let x0 = 0;
  let y0 = 0;
  let mx = 0;
  let my = 0;
  drag(e0, () => {
    x0 = parseFloat(e0.style.left);
    y0 = parseFloat(e0.style.top);
    mx = 0;
    my = 0;
  }, (dx, dy) => {
    mx = dx;
    my = dy;
    e0.style.left = px(x0 + dx);
    e0.style.top = px(y0 + dy);
  }, () => {
    const d = Math.hypot(mx, my);
    if (d < 90) return;
    stopDrag(e0);
    e0.querySelector(".gd")?.remove();
    e0.style.transition = "left .45s ease-in, top .45s ease-in, opacity .45s, transform .45s";
    e0.style.left = px(x0 + mx + mx / d * 400);
    e0.style.top = px(y0 + my + my / d * 400);
    e0.style.transform = `rotate(${mx / d * 50}deg)`;
    e0.style.opacity = 0;
    setTimeout(() => e0.remove(), 450);
    done();
  });
}

function openBag(bn, card, nw, nh) {
  T.innerHTML = "";
  stageEl.classList.remove("hidden");
  closeBtn.style.display = "";
  gdBtn.style.display = "";
  setGd(gdDef);
  fit();

  const W = 240;
  const H = Math.round(W * nh / nw);
  const sx = Math.round(W * 0.13);
  const L = (TW - W) / 2 - 30;
  const top = (TH - H) / 2;
  const ox = L + W - sx;
  const [bw, bh] = BS[bn];
  const by = top + (H - bh) / 2;
  const peek = ox - bw + 40;

  const bread = breadEl(bn, L + (W - sx - bw) / 2, by);
  const body = el(T, "bagpart", {
    left: px(L), top: px(top), width: px(W), height: px(H),
    backgroundImage: `url(${B[bn].img})`,
    clipPath: `polygon(0 0, ${px(W - sx)} 0, ${px(W - sx)} ${px(H)}, 0 ${px(H)})`
  });

  let g = guide(T, ox + sx / 2, top + 12, 90);
  const flap = curl(L, top, W, H, sx, B[bn].img, body, async () => {
    closeBtn.style.display = "none";
    g.remove();
    await wait(250);
    bread.style.transition = "left .5s cubic-bezier(.3,1.6,.5,1)";
    bread.style.left = px(peek);
    g = guide(bread, bw / 2, bh / 2, 0);

    const pk = makePack(card);
    let x0 = 0;
    let cx = peek;
    drag(bread, () => {
      x0 = cx;
    }, async (dx, dy) => {
      cx = Math.max(peek, x0 + dx);
      bread.style.left = px(cx);
      if (cx <= ox + 4) return;
      stopDrag(bread);
      g.remove();
      bread.classList.add("lifted");
      body.style.transition = "transform .5s ease-in, opacity .5s";
      body.style.transform = "translateY(160px)";
      body.style.opacity = 0;
      setTimeout(() => body.remove(), 500);
      flap.stop();
      for (const q of flap) {
        q.style.transition = "transform .5s ease-in, opacity .5s";
        q.style.transform = "translateY(160px) " + q.style.transform;
        q.style.opacity = 0;
        setTimeout(() => q.remove(), 500);
      }
      const lx = (TW - bw) / 2;
      const ly = LAND - bh / 2;
      bread.style.transition = "left .45s, top .45s";
      bread.style.left = px(lx);
      bread.style.top = px(ly);
      if (bn >= 2) pk.grp.style.opacity = 1;
      await wait(460);

      if (bn < 2) {
        el(T, "trayel", { left: px(lx), top: px(ly), width: px(bw), height: px(bh) }, '<img src="img/bread/tray.png">');
        bread.querySelector(".timg").remove();
        bread.classList.remove("lifted");
        bread.classList.add("lifted2");
        pk.grp.style.transition = "none";
        pk.grp.style.opacity = 1;
      }

      const breadStep = () => {
        guide(bread, bw / 2, bh / 2, 0);
        toss(bread, () => pk.start());
      };

      if (bn !== 2) return breadStep();
      bread.querySelector(".film").remove();
      const film = el(T, "film free", {
        left: px(lx - bw * 0.06), top: px(ly - bh * 0.06),
        width: px(bw * 1.12), height: px(bw * 1.12)
      });
      guide(film, bw * 0.56, bw * 0.56, 0);
      toss(film, breadStep);
    }, () => {});
  });
}

function makePack(card) {
  const PW = 130;
  const PH = 190;
  const py = 14;
  const cw = 96;
  const ch = 146;
  const gx = (TW - PW) / 2;
  const gy = LAND - PH / 2;
  const cx = (PW - cw) / 2;
  const peek = py - 34;

  const grp = el(T, "packg", { left: px(gx), top: px(gy), width: px(PW), height: px(PH), opacity: 0 });
  let cls = "pcard";
  if (card.mb === "RARE") cls += " rare";
  const cardEl = el(grp, cls, { left: px(cx), top: px(py + 10), width: px(cw), height: px(ch) }, `<img src="${card.img}">`);
  el(grp, "paper", { clipPath: clipBody(PW, PH, py) });
  const tearGo = tear(grp, PW, py);

  function start() {
    let g = guide(grp, 10, py / 2, 0);
    tearGo(async () => {
      g.remove();
      await wait(250);
      cardEl.style.transition = "top .5s cubic-bezier(.3,1.6,.5,1)";
      cardEl.style.top = px(peek);
      g = guide(grp, PW / 2, peek + 18, -90);

      let cy = peek;
      let y0 = 0;
      drag(cardEl, () => {
        g.remove();
        y0 = cy;
      }, (dx, dy) => {
        cy = Math.min(peek, y0 + dy);
        cardEl.style.top = px(cy);
        cardEl.style.transform = `rotate(${dx * 0.04}deg)`;
        if (cy + ch < py - 4) reveal(card, cardEl, grp, gx + cx, gy + cy, cw);
      }, () => {
        cardEl.style.transition = "transform .3s";
        cardEl.style.transform = "";
      });
    });
  }

  return { grp, start };
}

function reveal(card, cardEl, grp, x, y, cw) {
  stopDrag(cardEl);
  T.appendChild(cardEl);
  cardEl.style.transition = "none";
  cardEl.style.left = px(x);
  cardEl.style.top = px(y);
  cardEl.style.zIndex = 30;
  grp.style.transition = "opacity .4s, transform .4s";
  grp.style.opacity = 0;
  grp.style.transform = "translateY(80px)";
  for (const t of T.querySelectorAll(".trayel")) {
    t.style.transition = "opacity .4s, transform .4s";
    t.style.opacity = 0;
    t.style.transform = "translateY(80px)";
    setTimeout(() => t.remove(), 400);
  }
  cardEl.getBoundingClientRect();
  cardEl.style.transition = "left .6s cubic-bezier(.3,1.3,.5,1), top .6s cubic-bezier(.3,1.3,.5,1), transform .6s";
  cardEl.style.left = px((TW - cw) / 2);
  cardEl.style.top = px(110);
  cardEl.style.transform = "scale(1.9)";
  cardEl.classList.add("shine");
  cardEl.onclick = () => zoom(cardEl.querySelector("img"));

  const msg = gain(card);
  el(T, "reveal", { left: 0, top: px(410), width: px(TW) },
    `<h3>${card.n}</h3><p>${msg}</p><button class="pink" onclick="closeStage()">확인</button>`);
}

function gain(x) {
  x.c++;
  sCard++;
  let msg = B[inv[bi]].n + "에서 획득!";
  if (x.mb === "RARE") msg += " 레어 카드!";
  if (x.c > 1) msg += " (중복)";
  inv.splice(bi, 1);
  if (bi >= inv.length) bi = 0;
  h("lastCard", `<img src="${x.img}" onclick="showCard(${C.indexOf(x)})">`);
  h("resultTitle", x.n);
  h("resultText", msg);
  dI();
  dC();
  return msg;
}

const FL = ["전체", "레어"].concat(mn);
let flt = "전체";

function setF(f) {
  flt = f;
  dC();
}

function dC() {
  h("tabs", FL.map(f => `<button class="tab${f === flt ? " on" : ""}" onclick="setF('${f}')">${f}</button>`).join(""));
  let t = "";
  let got = 0;
  let all = 0;
  for (const [ci, x] of C.entries()) {
    let show = flt === "전체" || x.mb === flt;
    if (flt === "레어") show = x.mb === "RARE";
    if (!show) continue;
    all++;
    if (x.c > 0) {
      got++;
      t += `<div class="slot owned"><div class="picture"><img src="${x.img}" onclick="showCard(${ci})"></div><strong>${x.n}</strong>`;
    } else {
      t += '<div class="slot"><div class="picture">?</div><strong>미획득</strong>';
    }
    t += `<small>${x.mb}</small><div class="have">${x.c}장</div></div>`;
  }
  h("collectionList", t);
  h("collectionCount", got + " / " + all);
  dStat();
}

const zl = document.getElementById("zoomLayer");
let zoomed = null;

function place(z, r) {
  z.style.left = px(r.left);
  z.style.top = px(r.top);
  z.style.width = px(r.width);
  z.style.height = px(r.height);
}

function zoom(from) {
  if (zoomed) return unzoom();
  const r = from.getBoundingClientRect();
  const z = document.createElement("img");
  z.src = from.src;
  z.className = "zoomimg";
  place(z, r);
  zl.appendChild(z);
  zl.classList.remove("hidden");
  zoomed = { z, from };
  z.getBoundingClientRect();
  zl.classList.add("on");
  const ar = from.naturalWidth / from.naturalHeight || r.width / r.height;
  const hh = Math.min(innerHeight * 0.85, innerWidth * 0.9 / ar);
  const w = hh * ar;
  place(z, { left: (innerWidth - w) / 2, top: (innerHeight - hh) / 2, width: w, height: hh });
}

function unzoom() {
  if (!zoomed) return;
  const { z, from } = zoomed;
  zoomed = null;
  place(z, from.getBoundingClientRect());
  zl.classList.remove("on");
  setTimeout(() => {
    z.remove();
    if (!zoomed) zl.classList.add("hidden");
  }, 350);
}

zl.onclick = unzoom;
addEventListener("keydown", e => {
  if (e.key === "Escape") unzoom();
});

var t = "";
for (var i = 0; i < 5; i++) {
  t += '<div class="bread"><img src="' + B[i].img + '"><div class="breadinfo">';
  t += '<h3>' + B[i].n + '</h3><div class="price">' + won(P) + '</div></div></div>';
}
h("breadList", t);
add(0);
mk();
dI();
dC();

function toggleDbg() {
  if (!dbg) return openPw();
  setDbg(false);
}

function setDbg(on) {
  dbg = on;
  const b = document.getElementById("dbgButton");
  b.innerText = "관리자 디버그 " + (dbg ? "ON" : "OFF");
  b.classList.toggle("on", dbg);
  document.getElementById("openAll").classList.toggle("hidden", !dbg);
  document.getElementById("pickAll").classList.toggle("hidden", !dbg);
  document.getElementById("gdButton").classList.toggle("hidden", !dbg);
  add(0);
  if (!od && !rf) mk();
}

function toggleGd() {
  gdDef = !gdDef;
  const b = document.getElementById("gdButton");
  b.innerText = "가이드 " + (gdDef ? "ON" : "OFF");
  b.classList.toggle("on", gdDef);
  setGd(gdDef);
}

const pwLayer = document.getElementById("pwLayer");
let pw = "";

function pwDraw() {
  const d = document.querySelectorAll("#pwDots i");
  for (const [i, x] of d.entries()) x.classList.toggle("on", i < pw.length);
}

function openPw() {
  document.getElementById("pwBox").classList.remove("ok", "shake");
  document.getElementById("pwBox").style.height = "";
  h("pwTitle", "관리자 모드");
  h("pwMsg", "비밀번호 4자리를 입력하세요");
  pw = "";
  pwDraw();
  h("pwErr", "");
  pwLayer.classList.remove("hidden");
}

function closePw() {
  pwLayer.classList.add("hidden");
}

function pwKey(n) {
  if (pw.length >= 4 || document.getElementById("pwBox").classList.contains("ok")) return;
  pw += n;
  h("pwErr", "");
  pwDraw();
  if (pw.length === 4) setTimeout(checkPw, 150);
}

function pwBack() {
  pw = pw.slice(0, -1);
  pwDraw();
}

function checkPw() {
  if (pw === "9421") {
    const b = document.getElementById("pwBox");
    b.style.height = px(b.offsetHeight);
    b.classList.add("ok");
    h("pwTitle", "잠금 해제");
    h("pwMsg", "관리자 모드가 켜졌습니다");
    setTimeout(() => {
      closePw();
      setDbg(true);
    }, 2000);
    return;
  }
  h("pwErr", "비밀번호가 틀렸습니다");
  pw = "";
  pwDraw();
  const b = document.getElementById("pwBox");
  b.classList.remove("shake");
  b.getBoundingClientRect();
  b.classList.add("shake");
}

addEventListener("keydown", e => {
  if (pwLayer.classList.contains("hidden")) return;
  if (e.key >= "0" && e.key <= "9") pwKey(e.key);
  if (e.key === "Backspace") pwBack();
  if (e.key === "Enter" && pw.length === 4) checkPw();
  if (e.key === "Escape") closePw();
  e.preventDefault();
});

function openAll() {
  if (!dbg || busy || inv.length === 0) return;
  const n = inv.length;
  let rare = 0;
  let last = null;
  while (inv.length > 0) {
    last = C[Math.floor(Math.random() * C.length)];
    last.c++;
    sCard++;
    if (last.mb === "RARE") rare++;
    inv.pop();
  }
  bi = 0;
  h("lastCard", `<img src="${last.img}" onclick="showCard(${C.indexOf(last)})">`);
  h("resultTitle", n + "개 일괄 오픈");
  h("resultText", "레어 " + rare + "장 포함 · 마지막 카드: " + last.n);
  dI();
  dC();
}

function dStat() {
  h("stats",
    `<div><b>${sBread}</b><span>모은 빵/카드</span></div>` +
    `<div><b>${won(sSpent)}</b><span>쓴 돈</span></div>` +
    `<div><b>${sTry}</b><span>구매 시도</span></div>` +
    `<div><b>${sOk}</b><span>성공</span></div>` +
    `<div><b>${sFail}</b><span>실패</span></div>`);
}

function pickAll() {
  if (!dbg || od || rf) return;
  let all = true;
  for (let s = 0; s < 6; s++) {
    for (let j = 0; j < st[s].length; j++) {
      if (!pk[s] || !pk[s][j]) all = false;
    }
  }
  pk = [];
  ps = -1;
  if (!all) {
    for (let s = 0; s < 6; s++) {
      pk[s] = [];
      for (let j = 0; j < st[s].length; j++) pk[s][j] = true;
      if (st[s].length > 0) ps = s;
    }
  }
  dS();
}

function showCard(i) {
  if (busy) return;
  const x = C[i];
  busy = true;
  T.innerHTML = "";
  stageEl.classList.remove("hidden");
  closeBtn.style.display = "none";
  gdBtn.style.display = "none";
  fit();
  const cw = 96;
  let cls = "pcard showcard";
  if (x.mb === "RARE") cls += " rare";
  const c = el(T, cls, { left: px((TW - cw) / 2), top: px(110), width: px(cw), height: px(146), transform: "scale(1.9)", zIndex: 30 }, `<img src="${x.img}">`);
  c.getBoundingClientRect();
  c.classList.add("shine");
  c.onclick = () => zoom(c.querySelector("img"));
  let t = x.mb + " · 보유 " + x.c + "장";
  if (x.mb === "RARE") t = "레어 카드 · 보유 " + x.c + "장";
  el(T, "reveal", { left: 0, top: px(410), width: px(TW) },
    `<h3>${x.n}</h3><p>${t}</p><button class="pink" onclick="closeStage()">확인</button>`);
}

function cancelOrder() {
  if (!od) return;
  clearInterval(tm);
  add(tot);
  sTry--;
  od = false;
  ps = -1;
  pk = [];
  h("orderText", "주문이 취소되었습니다. 결제 금액 " + won(tot) + "이 환불되었습니다.");
  dS();
}
