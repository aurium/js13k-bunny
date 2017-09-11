"use strict";

var d = document;
var rnd = Math.random;
var round = Math.round;
var find = d.querySelector.bind(d);
var worldDeg = 0;
var pDeg = 0;
var pY = 0;
var jumpPrepare = 0;
var jumpForce = 0;
var unblockKeys = ['F5','F11','F12'];
var timeout = (secs, fn)=> setTimeout(fn, secs*1000);

var offAudioCtx = new OfflineAudioContext(2,44100*21,44100);

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

//   Cc   Eb        Fc   Gc   Bb
// C    D    E    F    G    A    B
var notes = [{
  C:16.35, Cc:17.32, D:18.35, Eb:19.45, E:20.60, F:21.83,
  Fc:23.12, G:24.50, Gc:25.96, A:27.50, Bb:29.14, B:30.87
}];
for (var i=1; i<=8; i++) {
  notes[i] = { };
  for (var n in notes[0]) notes[i][n] = notes[0][n] * Math.pow(2, i+1);
}

function playTone(freq, length, attack) {
  if (!attack) attack = 2;
  var o = audioCtx.createOscillator();
  o.frequency.value = freq;
  var g = audioCtx.createGain();
  g.connect(audioCtx.destination);
  g.gain.value = 0;
  g.gain.setValueAtTime(attack, audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + length);
  o.connect(g);
  o.start(0);
}

function playOffMusicNote(freq, start, end, attack) {
  if (!attack) attack = 2;
  var o = offAudioCtx.createOscillator();
  o.frequency.value = freq;
  var g = offAudioCtx.createGain();
  g.connect(offAudioCtx.destination);
  g.gain.value = 0;
  g.gain.setValueAtTime(attack, offAudioCtx.currentTime + start);
  g.gain.linearRampToValueAtTime(0, offAudioCtx.currentTime + end);
  o.connect(g);
  o.start(0);
}

// Parse and play ABC notation
function playABC(opts) {
  var callback = arguments[arguments.length-1] || function(){};
  if (!opts.time) opts.time = 1;
  if (!opts.attack) opts.attack = 1;
  var timePos = 0;
  var music = '';
  for (var i=1; i<arguments.length-1; i++) music += ' ' + arguments[i];
  music
  .replace(/([a-gzx])/ig, ' $1') // Separate notes
  .replace(/^\s*|\s*$/g,'')   // Trim
  .split(/\s+/).forEach((n)=>{
    var octave = ( 'abcdefg'.indexOf(n[0]) > -1 ) ? 4 : 3;
    if (n[1] === ',') {
      octave--;
      n = n[0] + n.substring(2);
    }
    if (n[1] === "'") {
      octave++;
      n = n[0] + n.substring(2);
    }
    var length = (n[1] ? n.substring(1) : '1');
    length = (length[0]==='/') ? (length.length===1) ? .5 : 1/parseInt(length[1]) : parseInt(length);
    length *= opts.time;
    n = n[0].toUpperCase();
    if (n !== 'Z') {
      playOffMusicNote(notes[octave][n], timePos, timePos+length, opts.attack);
    }
    timePos += length;
  });
  timeout(timePos+.1, callback);
  console.log('timePos', timePos);
}

// Create Song
playABC( // Aaachee's Reel
  {time:1/6, attack:1},
  'a2ed cAce eaae cAce a2ed cAce d2B2 B2ef',
  'a2ed cAce eaae cAce defg afed c2A2 A2',
  'ce',
  'f2cB AFce f2cB ABce f2cB AFGA G2E2 E2ce',
  'f2cB AFce fecB ABce fefg afed c2A2 A2',
  null
);

// Render and loop play
offAudioCtx.startRendering()
.then((renderedBuffer)=> {
  var song = audioCtx.createBufferSource();
  song.buffer = renderedBuffer;
  song.connect(audioCtx.destination);
  song.loop = true;
  song.start();
})
.catch((err)=> console.error('Music Fail', err) );


HTMLElement.prototype.mkEl = function mkEl(tag, css, attrs) {
  var att, el = d.createElement(tag);
  for (att in css) el.style[att] = css[att];
  if (attrs) for (att in attrs) el[att] = attrs[att];
  this.appendChild(el);
  el.del = ()=> this.removeChild(el);
  return el;
}

function mkBunny() {
  // <bw> wrapper
  //   <b> body
  //     <bl></bl> back leg
  //     <bh></bh> head
  //   </b>
  // </bw>
  var w = e.mkEl('bw',{},{className:'stopped'});
  var b = w.mkEl('b');
  w.b = b;
  b.mkEl('bl');
  b.mkEl('bh');
  return w;
}
var player = mkBunny();

function Carrot(x, y) {
  this.x = x;
  this.y = y;
  this.el = e.mkEl('carrot-wrap', {transform:`rotate(${x}deg)`, zIndex:2});
  this.el.mkEl('leaves', {transform:`translate(0, ${-1503-y}px)`} );
  this.el.mkEl('carrot', {transform:`translate(0, ${-1503-y}px)`} );
}

new Carrot(0,0);
new Carrot(0,20);
new Carrot(0,40);
new Carrot(20,0);
new Carrot(20,20);
new Carrot(20,40);

for (var x=0; x<360; x++) { // grass (capim)
  //e.mkEl('k', {transform:'rotate('+(x+rnd()*.4-.2)+'deg) translate(0,-'+(1511-rnd()*10)+'px)'});
  if (rnd()<0.3) e.mkEl('f', {transform:'rotate('+(x+rnd()-.5)+'deg) translate(0,-'+(1498-rnd()*20)+'px)'});
}

jumpPF.update = function() {
  if (player.className == 'prepare') {
    jumpPrepare++;
    if (jumpPrepare > 50) jumpPrepare = 50;
    this.style.height = jumpPrepare*2+'%';
  }
};

var montains = { bg1:[], bg2:[] };
function updateMontains(bg, prob) {
  if (rnd()<prob) {
    var w = round(180+rnd()*100);
    var h = round(1350+rnd()*80);
    var curMid = -worldDeg + worldDeg/2;
    if (bg.id==='bg2') curMid += worldDeg/4;
    var posX = curMid + 40;
    var m = bg.mkEl('m', {
      borderRadius: round(w/2.2)+'px', width:w+'px', marginLeft:'-'+round(w/2)+'px',
      transform:'rotate('+posX+'deg) translate(0,-'+h+'px)', zIndex: round(rnd()*5)
    });
    m.posX = posX;
    montains[bg.id].push(m);
  }
  if (montains[bg.id][0] && (montains[bg.id][0].posX < curMid - 40) ) {
    montains[bg.id].shift().del();
  }
}

for (worldDeg=200; worldDeg>0; worldDeg-=0.1) {
  if ( round(worldDeg*10) % 80 === 0 ) updateMontains(bg1, 0.6);
  if ( round(worldDeg*10) % 60 === 0 ) updateMontains(bg2, 0.6);
}

// Make Fire
//for (var i=0; i<3; i++) timeout(i*.3, ((i)=>()=> fire.mkEl('w', {left:(i*2+2)+'0%'}, {className:'fireBack fireBig'}))(i) );
timeout(.0, ()=> fire.mkEl('w', {left:'60%'}, {className:'fireBack fireBig'}) );
//for (var i=0; i<4; i++) timeout(i*.7, ((i)=>()=> fire.mkEl('w', {left:(i*2+1)+'0%'}, {className:'fireMid fireBig'}))(i) );
timeout(.3, ()=> fire.mkEl('w', {left:'50%'}, {className:'fireMid fireBig'}) );
timeout(.6, ()=> fire.mkEl('w', {left:'70%'}, {className:'fireMid fireBig'}) );
timeout(.9, ()=> fire.mkEl('w', {right:'112px', zIndex:1}, {className:'fireBackEdge'}) );
timeout(1.2, ()=> fire.mkEl('w', {right:'60px'}, {className:'fireEdge'}) );

setInterval(()=>{ // Tic
  worldDeg -= 0.1;
  if ( round(worldDeg*10) % 80 === 0 ) updateMontains(bg1, 0.6);
  if ( round(worldDeg*10) % 60 === 0 ) updateMontains(bg2, 0.6);
  e.style.transform = 'rotate('+(worldDeg)+'deg)'
  bg1.style.transform = 'rotate('+(-worldDeg/2)+'deg)'
  bg2.style.transform = 'rotate('+(-worldDeg/4)+'deg)'
  fireWrap.style.transform = 'rotate('+(-worldDeg-25)+'deg)'
  jumpPF.update();
  if (jumpForce > 0 || pY > 0) {
    pDeg += 0.5;
    pY += jumpForce;
    jumpForce -= 4;
    if (jumpForce < 0 && pY < 60) player.className='landing';
    if (pY <= 0) { player.className='stopped'; pY = 0; }
    player.style.transform = `rotate(${pDeg}deg) translate(0,-${1535+pY}px)`;
    console.log(player.style.transform,'---',pDeg,pY);
  }
}, 40);

d.addEventListener('keydown', function(ev) {
  if (unblockKeys.indexOf(ev.key)==-1) ev.preventDefault();
  console.log('keydown', ev);
  if ((ev.key==='ArrowUp'||ev.key===' ') && player.className==='stopped') {
    player.className = 'prepare';
    jumpPrepare = 5;
    jumpPF.update();
  }
});

d.addEventListener('keyup', function(ev) {
  if (unblockKeys.indexOf(ev.key)==-1) ev.preventDefault();
  if ((ev.key==='ArrowUp'||ev.key===' ') && player.className==='prepare') {
    playTone(400, jumpPrepare/22);
    playTone(300, jumpPrepare/20);
    player.className = 'jump';
    jumpForce = jumpPrepare;
    jumpPrepare = 0;
    jumpPF.style.height = 0;
  }
});

