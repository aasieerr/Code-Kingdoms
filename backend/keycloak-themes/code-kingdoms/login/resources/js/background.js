(function(){
  function inject(){
    var b = document.body;

    // Luna
    var moon = document.createElement('div');
    moon.id = 'ck-moon';
    b.appendChild(moon);

    // Nubes SVG
    var clouds = [
      {id:'ck-c1',top:'12%',vb:'0 0 96 24',w:96,h:24,rects:[
        [16,8,64,8],[8,8,8,8],[24,0,48,8],[80,8,8,8]
      ]},
      {id:'ck-c2',top:'7%',vb:'0 0 112 24',w:112,h:24,rects:[
        [0,8,112,8],[16,0,32,8],[64,0,32,8]
      ]},
      {id:'ck-c3',top:'23%',vb:'0 0 80 24',w:80,h:24,rects:[
        [8,8,64,8],[16,0,48,8]
      ]}
    ];
    clouds.forEach(function(c){
      var ns='http://www.w3.org/2000/svg';
      var svg=document.createElementNS(ns,'svg');
      svg.id=c.id; svg.className.baseVal='ck-cloud';
      svg.setAttribute('viewBox',c.vb);
      svg.setAttribute('width',c.w); svg.setAttribute('height',c.h);
      svg.style.top=c.top; svg.style.left='-200px';
      c.rects.forEach(function(r){
        var rect=document.createElementNS(ns,'rect');
        rect.setAttribute('x',r[0]);rect.setAttribute('y',r[1]);
        rect.setAttribute('width',r[2]);rect.setAttribute('height',r[3]);
        rect.setAttribute('fill','#1e2a4a');
        svg.appendChild(rect);
      });
      b.appendChild(svg);
    });

    // Castillo
    var wrap = document.createElement('div');
    wrap.id = 'ck-castle';
    wrap.innerHTML = '<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg">'
    // Montañas
    +'<polygon points="0,320 110,155 220,320" fill="#16142a"/>'
    +'<polygon points="70,320 210,115 350,320" fill="#1c1a36"/>'
    +'<polygon points="550,320 690,118 830,320" fill="#16142a"/>'
    +'<polygon points="630,320 770,140 900,320" fill="#1c1a36"/>'
    // Nieve
    +'<polygon points="110,155 98,182 122,182" fill="#c0d0e0"/>'
    +'<polygon points="210,115 196,145 224,145" fill="#c0d0e0"/>'
    +'<polygon points="690,118 676,148 704,148" fill="#c0d0e0"/>'
    +'<polygon points="770,140 756,168 784,168" fill="#c0d0e0"/>'
    // Torres laterales lejos
    +'<rect x="50" y="198" width="58" height="122" fill="#1a1228"/>'
    +'<rect x="46" y="186" width="8" height="18" fill="#1a1228"/>'
    +'<rect x="62" y="186" width="8" height="18" fill="#1a1228"/>'
    +'<rect x="78" y="186" width="8" height="18" fill="#1a1228"/>'
    +'<rect x="94" y="186" width="8" height="18" fill="#1a1228"/>'
    +'<rect x="66" y="228" width="16" height="22" fill="#261e4a"/>'
    +'<rect x="72" y="224" width="6" height="6" fill="#261e4a"/>'
    +'<rect x="792" y="198" width="58" height="122" fill="#1a1228"/>'
    +'<rect x="790" y="186" width="8" height="18" fill="#1a1228"/>'
    +'<rect x="806" y="186" width="8" height="18" fill="#1a1228"/>'
    +'<rect x="822" y="186" width="8" height="18" fill="#1a1228"/>'
    +'<rect x="838" y="186" width="8" height="18" fill="#1a1228"/>'
    +'<rect x="806" y="228" width="16" height="22" fill="#261e4a"/>'
    +'<rect x="812" y="224" width="6" height="6" fill="#261e4a"/>'
    // Murallas
    +'<rect x="108" y="238" width="196" height="82" fill="#201830"/>'
    +'<rect x="108" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="128" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="148" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="168" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="188" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="208" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="228" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="248" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="268" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="288" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="596" y="238" width="196" height="82" fill="#201830"/>'
    +'<rect x="596" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="616" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="636" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="656" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="676" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="696" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="716" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="736" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="756" y="228" width="14" height="14" fill="#201830"/>'
    +'<rect x="778" y="228" width="14" height="14" fill="#201830"/>'
    // Cuerpo central
    +'<rect x="304" y="158" width="292" height="162" fill="#281e3e"/>'
    // Torres centrales
    +'<rect x="278" y="118" width="76" height="202" fill="#231a36"/>'
    +'<rect x="276" y="106" width="14" height="18" fill="#231a36"/>'
    +'<rect x="296" y="106" width="14" height="18" fill="#231a36"/>'
    +'<rect x="316" y="106" width="14" height="18" fill="#231a36"/>'
    +'<rect x="334" y="106" width="14" height="18" fill="#231a36"/>'
    +'<rect x="296" y="160" width="18" height="26" fill="#180e2e"/>'
    +'<rect x="302" y="154" width="6" height="8" fill="#180e2e"/>'
    +'<rect x="296" y="208" width="18" height="26" fill="#180e2e"/>'
    +'<rect x="546" y="118" width="76" height="202" fill="#231a36"/>'
    +'<rect x="544" y="106" width="14" height="18" fill="#231a36"/>'
    +'<rect x="564" y="106" width="14" height="18" fill="#231a36"/>'
    +'<rect x="584" y="106" width="14" height="18" fill="#231a36"/>'
    +'<rect x="602" y="106" width="14" height="18" fill="#231a36"/>'
    +'<rect x="582" y="160" width="18" height="26" fill="#180e2e"/>'
    +'<rect x="588" y="154" width="6" height="8" fill="#180e2e"/>'
    +'<rect x="582" y="208" width="18" height="26" fill="#180e2e"/>'
    // Keep central
    +'<rect x="358" y="76" width="184" height="244" fill="#2c2246"/>'
    +'<rect x="358" y="60" width="18" height="22" fill="#2c2246"/>'
    +'<rect x="382" y="60" width="18" height="22" fill="#2c2246"/>'
    +'<rect x="406" y="60" width="18" height="22" fill="#2c2246"/>'
    +'<rect x="430" y="60" width="18" height="22" fill="#2c2246"/>'
    +'<rect x="454" y="60" width="18" height="22" fill="#2c2246"/>'
    +'<rect x="478" y="60" width="18" height="22" fill="#2c2246"/>'
    +'<rect x="502" y="60" width="18" height="22" fill="#2c2246"/>'
    // Ventana mágica
    +'<rect x="406" y="104" width="88" height="88" fill="#261850"/>'
    +'<rect x="422" y="96" width="56" height="12" fill="#261850"/>'
    +'<rect x="446" y="90" width="8" height="8" fill="#261850"/>'
    +'<rect x="414" y="112" width="72" height="72" fill="#1e1060" opacity="0.55"/>'
    +'<rect x="426" y="120" width="48" height="56" fill="#2a186e" opacity="0.45"/>'
    // Puerta
    +'<rect x="418" y="240" width="64" height="80" fill="#100a1e"/>'
    +'<rect x="432" y="232" width="36" height="12" fill="#100a1e"/>'
    +'<rect x="446" y="226" width="8" height="8" fill="#100a1e"/>'
    // Barrotes
    +'<rect x="422" y="244" width="4" height="72" fill="#1c1430" opacity="0.85"/>'
    +'<rect x="432" y="244" width="4" height="72" fill="#1c1430" opacity="0.85"/>'
    +'<rect x="442" y="244" width="4" height="72" fill="#1c1430" opacity="0.85"/>'
    +'<rect x="452" y="244" width="4" height="72" fill="#1c1430" opacity="0.85"/>'
    +'<rect x="462" y="244" width="4" height="72" fill="#1c1430" opacity="0.85"/>'
    +'<rect x="472" y="244" width="4" height="72" fill="#1c1430" opacity="0.85"/>'
    // Antorcha izq keep
    +'<rect x="348" y="218" width="6" height="18" fill="#5a3a10"/>'
    +'<rect x="346" y="212" width="10" height="8" fill="#6a4a18"/>'
    +'<g class="ck-flame"><rect x="346" y="198" width="4" height="16" fill="#ff8c00"/>'
    +'<rect x="347" y="194" width="6" height="8" fill="#ffa020"/>'
    +'<rect x="348" y="190" width="4" height="6" fill="#ffcc40"/>'
    +'<rect x="349" y="188" width="2" height="4" fill="#fff0a0"/></g>'
    // Antorcha der keep
    +'<rect x="546" y="218" width="6" height="18" fill="#5a3a10"/>'
    +'<rect x="544" y="212" width="10" height="8" fill="#6a4a18"/>'
    +'<g class="ck-flame ck-f2"><rect x="544" y="198" width="4" height="16" fill="#ff8c00"/>'
    +'<rect x="545" y="194" width="6" height="8" fill="#ffa020"/>'
    +'<rect x="546" y="190" width="4" height="6" fill="#ffcc40"/>'
    +'<rect x="547" y="188" width="2" height="4" fill="#fff0a0"/></g>'
    // Antorcha muralla izq
    +'<rect x="206" y="246" width="6" height="16" fill="#5a3a10"/>'
    +'<rect x="204" y="240" width="10" height="8" fill="#6a4a18"/>'
    +'<g class="ck-flame ck-f3"><rect x="204" y="226" width="4" height="16" fill="#ff8c00"/>'
    +'<rect x="205" y="222" width="6" height="8" fill="#ffa020"/>'
    +'<rect x="206" y="218" width="4" height="6" fill="#ffcc40"/>'
    +'<rect x="207" y="216" width="2" height="4" fill="#fff0a0"/></g>'
    // Antorcha muralla der
    +'<rect x="688" y="246" width="6" height="16" fill="#5a3a10"/>'
    +'<rect x="686" y="240" width="10" height="8" fill="#6a4a18"/>'
    +'<g class="ck-flame ck-f2"><rect x="686" y="226" width="4" height="16" fill="#ff8c00"/>'
    +'<rect x="687" y="222" width="6" height="8" fill="#ffa020"/>'
    +'<rect x="688" y="218" width="4" height="6" fill="#ffcc40"/>'
    +'<rect x="689" y="216" width="2" height="4" fill="#fff0a0"/></g>'
    +'</svg>';
    b.appendChild(wrap);

    // Suelo
    var ground = document.createElement('div');
    ground.id = 'ck-ground';
    b.appendChild(ground);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
