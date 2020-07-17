

var FPS = 30; // フレームレート
var SCREEN_WIDTH = 700; // 画面サイズ
var SCREEN_HEIGHT = 500;
var NUM_BOIDS = 300; // ボイドの数
var BOID_SIZE = 8; // ボイドの大きさ
var MAX_SPEED = 4; // ボイドの最大速度
var MIN_SPEED = 2; // ボイドの最小速度
var COHESION = 12; // 凝集力
var INFULUENCE_RADIUS = 60; // 影響範囲

var player = {
  // プレイヤの位置
  x: SCREEN_WIDTH / 2,
  y: SCREEN_HEIGHT / 2,
  vx: 0,
  vy: 0,
};
var PLAYER_MAX_SPEED = 5.5;
var maxsteer = 0.12;
var SCORE = 0;

var boids = [];
var ax = 0;
var ay = 0;
var score_Text = 'SCORE : ' + SCORE;
var time = 30; // 制限時間

var process_nth = 0;
var sW = 0; //cavvasの位置
var sH = 0;

//読み込み時の表示\
window_load();
//ウィンドウサイズ変更時に更新
window.onresize = window_load;


window.onload = function() {
var canvas = document.getElementById('world');
window.ctx = canvas.getContext('2d');
var style = canvas.style;
style.marginLeft = "auto";
style.marginRight = "auto";
var parentStyle = canvas.parentElement.style;
parentStyle.textAlign = "center";
parentStyle.width = "100%";
console.log(canvas);
//コントローラー
gui = new dat.GUI({ name: 'controller' });
gui.add(window, 'NUM_BOIDS', 0, 500).step(1);
gui.add(window, 'BOID_SIZE', 0, 30).step(0.1);
gui.add(window, 'MAX_SPEED', 0.1, 10).step(0.1);
gui.add(window, 'MIN_SPEED', 0.1, 10).step(0.1);
gui.add(window, 'COHESION', 0, 30).step(0.1);
gui.add(window, 'INFULUENCE_RADIUS', 0, 200).step(0.1);

  document.getElementById('2').style.visibility = 'hidden';
  document.getElementById('3').style.visibility = 'hidden';

  /* 初期化 */
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  ctx.fillStyle = 'rgba(33, 33, 33, 0.8)'; // ボイドの色
  for (var i = 0; i < 500; ++i) {
    initialize_fish(i);
  }

  /* ループ開始 */
  var main = setInterval(simulate, 1000 / FPS);
  var fishmove = setInterval(fishm, 1000 / FPS);
  var count = setInterval(countdown, 100);
  setTimeout(function () {
    clearInterval(fishmove);
  }, time * 1000);

  setTimeout(function () {
    clearInterval(main);
  }, time * 1000);

  setTimeout(function () {
    clearInterval(count);
  }, time * 1000);

  setTimeout(finish, time * 1000);
};

var start = function () {};

var initialize_fish = function (index) {
  boids[index] = {
    x: Math.random() * SCREEN_WIDTH, // x座標
    y: Math.random() * SCREEN_HEIGHT, // y座標
    vx: Math.random() * 4 - 2, // x方向の速度
    vy: Math.random() * 4 - 2, // y方向の速度
    //xxx: [SCREEN_WIDTH / 2, SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
    //yyy: [SCREEN_HEIGHT / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / 2],
  };
};
/* プレイヤー操作 */
var fishm = function () {
  window.onmousemove = handleMouseMove;
  function handleMouseMove(event) {

    ax = event.clientX-sW;// - canvas.offsetLeft;
    ay = event.clientY-sH; //- canvas.offsetTop;
    // console.log("client " + event.clientX,event.clientY);
    //console.log("page "+ event.pageX,event.pageY);
    //console.log("axay "+ ax,ay);

}

  /* プレイヤーの位置更新 */

  var fspeed = Math.sqrt(
    (ax - player.x) * (ax - player.x) + (ay - player.y) * (ay - player.y)
  );
  //Math.sqrtは √ax*ax + ay*ay を出力, プレイヤーとカーソルの距離の計算

  if (fspeed < -2 || fspeed > 2) {
    /*
            1に正規化                   ステアリング適用
      (((ax - player.x) / fspeed) - player.vx) * maxsteer
      */
    player.vx += ((ax - player.x) / fspeed - player.vx) * maxsteer;
    player.vy += ((ay - player.y) / fspeed - player.vy) * maxsteer;
    player.x += player.vx * PLAYER_MAX_SPEED;
    player.y += player.vy * PLAYER_MAX_SPEED;
  }

  if (5 < player.x && player.x < SCREEN_WIDTH - 5) {
    //壁にぶつかったら跳ね返る
    player.x -= player.vy / 1.5;
  } else if (5 >= player.x) {
    player.x += 1;
  }
  if (player.x >= SCREEN_WIDTH - 5) {
    player.x -= 1;
  }
  if (5 < player.y && player.y < SCREEN_HEIGHT - 5) {
    player.y -= player.vx / 1.5;
  } else if (5 >= player.y) {
    player.y += 1;
  }
  if (player.y >= SCREEN_HEIGHT - 5) {
    player.y -= 1;
  }
};

/* カウントダウン */
var countdown = function () {
  time -= 0.1;
  if (time < 0) {
    clearTimeout(count); //idをclearTimeoutで指定している
  }
  // console.log(process_nth);
  // process_nth +=1;
  // if(process_nth%3 == 0) process_nth = 0;
};

/* シミュレーション */
var simulate = function () {
  draw(); // ボイドの描画
  move(); // ボイドの座標の更新
};

/**
 * ボイドの描画
 */
var draw = function () {
  start();
};
var start = function () {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); // 画面をクリア

  // 全てのボイドの描画
  for (var i = 0; i < NUM_BOIDS; ++i) {
    var rad = -Math.atan2(boids[i].vx, boids[i].vy) + (90 * Math.PI) / 180;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.lineCap = 'butt';
    ctx.moveTo(boids[i].x, boids[i].y);
    ctx.lineTo(
      boids[i].x + BOID_SIZE * Math.cos(rad),
      boids[i].y + BOID_SIZE * Math.sin(rad)
    );
    ctx.stroke();
  }

  var rad = -Math.atan2(player.vx, player.vy) + (90 * Math.PI) / 180;
  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + 8 * Math.cos(rad), player.y + 8 * Math.sin(rad));
  ctx.stroke();

  score_Text = 'SCORE : ' + SCORE;
  ctx.font = '24px Arial'; //フォントにArial,24pxを指定
  ctx.fillStyle = 'white'; //塗り潰し色を白に
  ctx.textBaseline = 'top';
  ctx.fillText(score_Text, 40, 40);

  ctx.font = '24px Arial'; //フォントにArial,24pxを指定
  ctx.fillStyle = 'white'; //塗り潰し色を白に
  ctx.textBaseline = 'top';
  ctx.fillText(time.toFixed(1), SCREEN_WIDTH - 80, 40); //toFixed(1)は少数点の指定
};

/**
 * ボイドの位置の更新
 */
var move = function () {
  for (var i = 0; i < NUM_BOIDS; ++i) {
    // ルールを適用して速さを変更
    rule1(i); // 近くの群れの真ん中に向かおうとする
    rule3(i);
    rule4(i); //

    // limit speed
    var b = boids[i];
    var speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (speed >= MAX_SPEED) {
      if (fishd > 70) {
        var r = MIN_SPEED / speed;
        b.vx *= r;
        b.vy *= r;
      } else {
        var r = MAX_SPEED / speed;
        b.vx *= r;
        b.vy *= r;
      }
    } else if (speed <= MIN_SPEED) {
      var p = MIN_SPEED / speed;
      b.vx *= p;
      b.vy *= p;
    }
    // 壁の外に出てしまった場合速度を内側へ向ける
    if ((b.x < 60 && b.vx < 0) || (b.x > SCREEN_WIDTH && b.vx > 0)) {
      if (b.vy > 0) {
        b.vy += 0.01;
        b.vx += -0.01;
      } else {
        b.vy += -0.01;
        b.vx += -0.01;
      }
    }
    if ((b.x < 10 && b.vx < 0) || (b.x > SCREEN_WIDTH && b.vx > 0)) {
      b.vx *= -1;
    }
    if ((b.y < 40 && b.vy < 0) || (b.y > SCREEN_HEIGHT && b.vy > 0)) {
      if (b.vy > 0) {
        b.vx += 0.01;
        b.vy += -0.01;
      } else {
        b.vx += -0.01;
        b.vy += -0.01;
      }
    }
    if ((b.y < 10 && b.vy < 0) || (b.y > SCREEN_HEIGHT && b.vy > 0)) {
      b.vy *= -1;
    }
    // 座標の更新
    b.x += b.vx;
    b.y += b.vy;
  }
};

/**
 * ルール1: ボイドは近くに存在する群れの中心に向かおうとする
 */
var rule1 = function (index) {
  var isLoneFish = true;
  for (var i = 0, len = NUM_BOIDS; i < len; ++i) {
    if (i != index) {
      var d = getDistance(boids[i], boids[index]);
      if (d < 5) {
        boids[index].vx += (boids[i].vx - boids[index].vx) / 400;
        boids[index].vy += (boids[i].vy - boids[index].vy) / 400;
        isLoneFish = false;
      } else if (d < INFULUENCE_RADIUS / 3) {
        boids[index].vx += (boids[i].x - boids[index].x) / 1000;
        boids[index].vy += (boids[i].y - boids[index].y) / 1000;
        isLoneFish = false;
      } else if (d < INFULUENCE_RADIUS) {
        boids[index].vx += (boids[i].x - boids[index].x) / 10000;
        boids[index].vy += (boids[i].y - boids[index].y) / 10000;
      }
      if (2 < d && d < 20) {
        boids[index].vx += ((boids[i].vx - boids[index].vx) * d) / 600;
        boids[index].vy += ((boids[i].vy - boids[index].vy) * d) / 600;
      }
      rule2(index, i, d);
    }
  }
  if (isLoneFish) {
    rule3(index);
  }
};

/*
 * ルール2: ボイドは隣のボイドとちょっとだけ距離をととするろう
 */
var rule2 = function (index, i, d) {
  if (d < COHESION) {
    var discrete = Math.pow(d < 10 ? 1 : d, 1) * COHESION;
    boids[index].vx -= (boids[i].x - boids[index].x) / discrete;
    boids[index].vy -= (boids[i].y - boids[index].y) / discrete;
  }
};

/*
 * ルール3:
 */
var rule3 = function (index) {
  var randNum = Math.floor(Math.random() * 10);
  if (randNum == 1) {
    boids[index].vx += Math.random() * 2 - 1;
    boids[index].vy += Math.random() * 2 - 1;
  }
};

/*
 *プレイヤーから逃げる
 */
var rule4 = function (index) {
  if (
    boids[index].x > player.x - 70 ||
    boids[index].x > player.x + 70 ||
    boids[index].y > player.y - 70 ||
    boids[index].y > player.y + 70
  ) {
    fishd = getDistance(boids[index], player);
    if (fishd < 5) {
      SCORE += 10;
      initialize_fish(index);
    } else if (fishd < 70) {
      if (fishd <= 30) {
        boids[index].vx += (boids[index].x - player.x) / 40;
        boids[index].vy += (boids[index].y - player.y) / 40;
      } else {
        boids[index].vx += (boids[index].x - player.x) / 1000;
        boids[index].vy += (boids[index].y - player.y) / 1000;
      }
    }
  }
};

/**
 * 2つのボイド間の距離
 */
var getDistance = function (b1, b2) {
  var x = b1.x - b2.x;
  var y = b1.y - b2.y;
  return Math.sqrt(x * x + y * y);
};

/* タイムアップしたときの処理 */
var finish = function () {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); // 画面をクリア

  // 全てのボイドの描画
  start();

  document.getElementById('2').style.visibility = 'visible';
  document.getElementById('3').style.visibility = 'visible';
};

/* ボタンをタッチしたときの処理 */

/* 続ける */
function OnButtonClick() {
  time = 0;
  var main = setInterval(simulate, 1000 / FPS);
  var fishmove = setInterval(fishm, 1000 / FPS);
  document.getElementById('2').style.visibility = 'hidden';
  document.getElementById('3').style.visibility = 'hidden';
}

/* 最初から */
function OnButtonClick1() {
  SCORE = 0;
  time = 30;
  var main = setInterval(simulate, 1000 / FPS);
  var fishmove = setInterval(fishm, 1000 / FPS);
  var count = setInterval(countdown, 100);
  setTimeout(function () {
    clearInterval(fishmove);
  }, time * 1000);
  setTimeout(function () {
    clearInterval(main);
  }, time * 1000);
  setTimeout(finish, time * 1000);
  setTimeout(function () {
    clearInterval(count);
  }, time * 1000);

  document.getElementById('2').style.visibility = 'hidden';
  document.getElementById('3').style.visibility = 'hidden';
}

function window_load() {
  sW = (window.innerWidth - SCREEN_WIDTH) / 2;
  sH = (window.innerHeight - SCREEN_HEIGHT) / 2;
  console.log(sW);
  console.log(sW);
}
