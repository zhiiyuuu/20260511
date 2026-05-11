let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let isModelReady = false;
let currentStyle = 1; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // 分段載入，確保穩定性
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipHorizontal: true }, () => {
    handPose = ml5.handPose({ maxHands: 1, flipHorizontal: true }, () => {
      isModelReady = true;
      faceMesh.detectStart(capture, gotFaces);
      handPose.detectStart(capture, gotHands);
    });
  });
}

function draw() {
  background(173, 216, 230); // 淡藍色背景

  if (!isModelReady) {
    drawLoading();
    return;
  }

  // 1. 繪製全螢幕攝影機影像 (鏡像)
  push();
  translate(width, 0);
  scale(-1, 1);
  let scaleFactor = max(width / capture.width, height / capture.height);
  let imgW = capture.width * scaleFactor;
  let imgH = capture.height * scaleFactor;
  image(capture, (width - imgW) / 2, (height - imgH) / 2, imgW, imgH);
  pop();

  // 2. 在中層上方顯示名字 (可愛粗體)
  drawName();

  // 3. 手勢判斷
  checkGesture();

  // 4. 繪製耳環
  if (faces.length > 0) {
    let face = faces[0];
    let leftEar = getPos(face.keypoints[132]);
    let rightEar = getPos(face.keypoints[361]);
    
    drawEarring(leftEar.x, leftEar.y, currentStyle);
    drawEarring(rightEar.x, rightEar.y, currentStyle);
  }
}

function gotFaces(results) { faces = results; }
function gotHands(results) { hands = results; }

function drawName() {
  push();
  textAlign(CENTER, CENTER);
  
  // 設定可愛粗體的效果：白色文字 + 深藍色圓潤描邊
  strokeWeight(6);
  stroke(40, 80, 120); // 深藍色邊框
  fill(255); // 白色字體
  textStyle(BOLD);
  textSize(40); // 夠大的字體
  
  // 顯示在畫布中層的上方
  text("41273oo78 林oo", width / 2, height * 0.2);
  pop();
}

function checkGesture() {
  if (hands.length > 0) {
    let hand = hands[0];
    let count = 0;
    if (hand.keypoints[8].y < hand.keypoints[6].y) count++;
    if (hand.keypoints[12].y < hand.keypoints[10].y) count++;
    if (hand.keypoints[16].y < hand.keypoints[14].y) count++;
    if (hand.keypoints[20].y < hand.keypoints[18].y) count++;
    if (dist(hand.keypoints[4].x, hand.keypoints[4].y, hand.keypoints[2].x, hand.keypoints[2].y) > 40) count++;

    if (count >= 1 && count <= 5) currentStyle = count;
  }
}

function drawEarring(x, y, style) {
  push();
  translate(x, y + 20);
  noStroke();
  if (style === 1) { // 圓環
    noFill(); stroke(218, 165, 32); strokeWeight(4); ellipse(0, 10, 20, 20);
  } else if (style === 2) { // 珍珠
    stroke(184, 134, 11); strokeWeight(1); line(0, -10, 0, 10);
    noStroke(); fill(245, 245, 220); ellipse(0, 20, 15, 18);
    fill(255, 200); circle(-3, 18, 5);
  } else if (style === 3) { // 流蘇
    fill(218, 165, 32); arc(0, 0, 15, 15, PI, TWO_PI);
    stroke(200, 0, 0); strokeWeight(1); for(let i=-4; i<=4; i+=2) line(i, 2, i, 25);
  } else if (style === 4) { // 玉石
    fill(218, 165, 32); ellipse(0, 15, 22, 30);
    fill(0, 100, 0); ellipse(0, 15, 18, 26);
  } else if (style === 5) { // 鳳凰
    fill(255, 215, 0); triangle(0, 0, -10, 10, 10, 10);
    fill(150, 0, 0); circle(0, 22, 10);
  }
  pop();
}

function getPos(kp) {
  let scaleFactor = max(width / capture.width, height / capture.height);
  let imgW = capture.width * scaleFactor;
  let imgH = capture.height * scaleFactor;
  let xOffset = (width - imgW) / 2;
  let yOffset = (height - imgH) / 2;
  let x = map(kp.x, 0, capture.width, width - xOffset, xOffset);
  let y = map(kp.y, 0, capture.height, yOffset, yOffset + imgH);
  return { x, y };
}

function drawLoading() {
  fill(40, 80, 120);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("正在啟動 AI 試戴系統...", width/2, height/2);
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }