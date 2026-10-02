// Hradčany: panorama Pražského hradu a Malé Strany přes Vltavu ze Smetanova nábřeží.
// Vrstvy odzadu: obloha, Petřín s rozhlednou a Strahov, Letná, hrad s katedrálou sv. Víta, sv. Jiřím a Černou věží,
// zahrady pod hradem, střechy Malé Strany se sv. Mikulášem, Vltava s Kampou a Karlovým mostem, lodě a šlapadla,
// Staroměstská mostecká věž, nábřeží s lampami, promenáda (lípy, kavárna, kiosek, muzikant) a ulice s tramvají.
// Prostředí se registruje přes SCENE(); build(K) dostane sdílené nástroje z jádra (index.html).
SCENE({id:"hradcany",ver:2,name:"Hradčany",where:"v oknech a na střechách Malé Strany, na hradě, na Karlově mostě, na lodích i na nábřeží",
  // kolik koček smí mít jeden druh úkrytu (neuvedený druh = 1)
  caps:{mswin:2,dormer:1,chimney:1,msroof:1,gable:1,nicholas:1,bridgetower:1,castlewin:1,castleroof:1,vitus:1,george:1,
    blacktower:1,daliborka:1,terrace:1,gazebo:1,kampa:1,mill:1,statue:1,parapet:2,pier:1,boat:2,deck:1,pedalo:2,rowboat:1,
    oldtower:2,railing:2,lamp:1,linden:2,bench:2,underbench:1,cafe:2,kiosk:1,kioskroof:1,busker:1,bike:1,cart:1,bin:1,pot:1,painter:1,oldcar:1,
    tram:2,tramroof:1,stop:1},
build(K){
  const{R,rr,add,spot,S,reg,head,sitCat,loafCat,sleepCat,peek,layout,pick,arch,place,sky,pot}=K;
  const PI=Math.PI,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  // měřítko podle hloubky (y paty): hrad a Malá Strana ~.5, most .6–.9, nábřeží 1, ulice 1.15
  const D=y=>cl(.5+(y-900)*.00085,.45,1.15);
  const ks=(o,b,y)=>S(o,b)*D(y);
  const hr=(b,y)=>Math.max(22,b*D(y))*.4;          // poloměr hlavy dospělé kočky (kontrola zákrytu)
  // zákryty: obdélníky kreslené později (o = pořadí vrstvy). Úkryt se zaregistruje, jen když hlavu kočky
  // (střed x, brada cy, poloměr r) nezakryje nic z pozdější vrstvy.
  const OCC=[];
  const occ=(x0,x1,y0,y1,o)=>{OCC.push({x0,x1,y0,y1,o});OG=null};
  // zákryty v sloupcích po 100 jednotkách (rychlé hledání)
  let OG=null;const og=()=>{OG=[];for(const c of OCC)for(let k=Math.max(0,Math.floor(c.x0/100));k<=Math.min(31,Math.floor(c.x1/100));k++)(OG[k]||(OG[k]=[])).push(c);return OG};
  const free=(x,cy,r,o)=>{const b=(OG||og())[cl(Math.floor(x/100),0,31)]||[];return b.every(c=>c.o<=o||c.x1<x-r*.6||c.x0>x+r*.6||c.y0>cy-r*.7||c.y1<cy-r*1.7)};

  /* pomocníci */
  // hladká křivka (Catmull-Rom) jako lomená čára s krokem ~step
  function spline(P,step=30){const o=[];
    for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)],n=Math.max(1,Math.round(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step));
      for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,c=j=>.5*(2*p1[j]+(p2[j]-p0[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(3*p1[j]-p0[j]-3*p2[j]+p3[j])*t3);o.push([c(0),c(1)])}}
    o.push(P[P.length-1].slice());return o}
  const yAt=(P,x)=>{if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(P[i][0]>=x){const a=P[i-1],b=P[i];return a[1]+(b[1]-a[1])*(x-a[0])/((b[0]-a[0])||1)}return P[P.length-1][1]};
  // korunka stromu v dálce
  const bump=(q,x,y,r)=>q.curve([[x-r,y],[x-r*.9,y-r*.8],[x-r*.2,y-r*1.1],[x+r*.5,y-r*.95],[x+r,y]],false);
  // levné rovné tahy bez náhody (drobnosti ve velkém počtu: okna, římsy, dlažba); jemné chvění z polohy
  const ql=(q,x1,y1,x2,y2)=>{q.p.moveTo(x1,y1);q.p.lineTo(x2,y2);q.bb(x1,y1);q.bb(x2,y2)};
  const qb=(q,x,y,w,h)=>{const p=q.p,e=Math.sin(x*1.37+y*.71)*.7,f=Math.sin(x*.53+y*1.91)*.7;p.moveTo(x+e,y+f);p.lineTo(x+w-f,y+e*.6);p.lineTo(x+w+e*.5,y+h-f);p.lineTo(x+f*.6,y+h+e);p.closePath();q.bb(x,y);q.bb(x+w,y+h)};
  const qp=(q,pts)=>{const p=q.p;p.moveTo(pts[0][0],pts[0][1]);for(const[x,y]of pts){p.lineTo(x,y);q.bb(x,y)}p.closePath()};
  // elipsa jako hladká křivka přes n bodů (bez náhody, kosiny z tabulky)
  const EC={};const ecs=n=>EC[n]||(EC[n]=[...Array(n).keys()].map(k=>[Math.cos(k*6.283/n),Math.sin(k*6.283/n),1+((k*7)%5-2)*.025]));
  const qe=(q,cx,cy,rx,ry,n=8)=>{const p=[];for(const[c,d,m]of ecs(n))p.push([cx+c*rx*m,cy+d*ry*m]);q.curve(p,true)};
  // oblouk (okna, arkády) s tabulkou úhlů místo K.arch
  const AT=[...Array(13).keys()].map(i=>[Math.cos(Math.PI+i/12*Math.PI),Math.sin(Math.PI+i/12*Math.PI)]);
  const farch=(cx,yt,r,yb)=>{const p=[[cx-r,yb]];for(const[c,d]of AT)p.push([cx+c*r,yt+r+d*r]);p.push([cx+r,yb]);return p};
  const dome=(cx,b,rx,ry,n=12)=>{const p=[];for(let i=0;i<=n;i++){const a=PI+i/n*PI;p.push([cx+Math.cos(a)*rx,b+Math.sin(a)*ry])}return p};
  // cibulová báň: pata b, šířka w, výška h
  const onion=(cx,b,w,h)=>[[cx-w*.46,b],[cx-w*.56,b-h*.3],[cx-w*.36,b-h*.62],[cx-w*.1,b-h*.84],[cx,b-h],[cx+w*.1,b-h*.84],[cx+w*.36,b-h*.62],[cx+w*.56,b-h*.3],[cx+w*.46,b]];
  // obdélník se zaoblenými horními rohy (tramvaj, lodní kajuta)
  const rbox=(x0,y0,x1,y1,r)=>{const p=[[x0,y1]];for(let k=0;k<=5;k++){const a=PI+k/5*PI/2;p.push([x0+r+Math.cos(a)*r,y0+r+Math.sin(a)*r])}
    for(let k=0;k<=5;k++){const a=-PI/2+k/5*PI/2;p.push([x1-r+Math.cos(a)*r,y0+r+Math.sin(a)*r])}p.push([x1,y1]);return p};

  /* ---------- geometrie Karlova mostu (vzdálený konec vlevo u Malé Strany, blízký vpravo u Staroměstské věže) ---------- */
  // Jeden horizont HY pro celou scénu (i dlažba promenády). Most vede kolmo přes řeku a ubíhá šikmo od diváka:
  // zábradlí i pata mostu na hladině míří do společného úběžníku (VX, HY) vlevo za obrazem. Měřítko je úměrné
  // vzdálenosti od úběžníku, rozestupy pilířů se zkracují projektivně (t = skutečná poloha podél mostu 0…1).
  // BR = poměr měřítka vzdáleného a blízkého konce: čím blíž 1, tím méně šikmý pohled (úběžník daleko vlevo,
  // most mírně skloněný) a tím širší jsou i vzdálené oblouky. FH = výška čela (zábradlí – hladina) v měřítku.
  const HY=580,NA=16,PW=.125,BR=.72,FH=84;   // PW: polovina pilíře jako díl pole (pilíř ~1/3 rozpětí)
  const BA=[780,955],BB=[2735,HY+(955-HY)/BR];
  const VX=(BA[0]-BR*BB[0])/(1-BR);
  const bm=t=>1/(1/BR+(1-1/BR)*t);
  const BP=t=>{const m=bm(t);return[VX+(BB[0]-VX)*m,HY+(BB[1]-HY)*m]};
  const bs=t=>.98*bm(t);
  const parY=x=>HY+(BB[1]-HY)*(x-VX)/(BB[0]-VX);             // horní hrana zábradlí
  const sAt=x=>.98*(x-VX)/(BB[0]-VX);                          // měřítko mostu v místě x
  const watY=x=>parY(x)+FH*sAt(x);              // hladina pod mostem (míří do stejného úběžníku)
  const BK=30,BMIN=.72;                          // kočka na mostě a na lodích: základ BK·měřítko (polovina chodce);
                                                 // úkryty na mostě jen tam, kde by kočka nebyla menší než MIN_S
  const PT=1446,TY=1852;                                    // zídka nábřeží, kolej tramvaje
  const P9=y=>90+y*1e-4;                                    // pořadí předmětů na promenádě (vpředu později)
  const O={castle:2,garden:5,row0:10,nic:20,church:25,row1:30,row2:40,mst:45,kampa:50,bridge:60,boat:70,oldt:80,quay:85,prom:90};

  /* ---------- obloha a vzdálený plán ---------- */
  // les v řadách: každá řada je pás s vroubkovaným horním okrajem (koruny), přední řady zakrývají zadní.
  // top(x) = horní hranice lesa, řady od y0 do y1, rf(y) = poloměr korun
  // levná náhoda pro drobné chvění korun: tabulka čísel z R, čte se dokola
  const TB=[];for(let i=0;i<251;i++)TB.push(R());let ti=0;
  const rn=(a,b)=>a+(b-a)*TB[ti=ti>249?0:ti+1];
  function canopy(top,x0,x1,y0,y1,rf){const cu=[];
    for(let y=y0;y<y1;){const r=rf(y),yb=y+r*2.4,cr=[];
      for(let x=x0+rn(-r,0);x<x1;){const c=r*rn(.75,1.25),t=top(x+c);if(t<y+c*.3){cr.push([x,Math.max(y,t+c*.5)+rn(-2,2),c]);x+=c*rn(1.4,1.8)}else x+=c*2.5}
      if(cr.length){add('paper',1,q=>{const p=q.p,[fx,fy]=cr[0];p.moveTo(fx,yb);p.lineTo(fx,fy);
        for(const[x,cy,c]of cr){p.lineTo(x,cy);p.quadraticCurveTo(x,cy-c,x+c,cy-c);p.quadraticCurveTo(x+c*2,cy-c,x+c*2,cy);q.bb(x,cy-c);q.bb(x+c*2,cy)}
        const[lx,ly,lc]=cr[cr.length-1];p.lineTo(lx+lc*2.6,yb);p.closePath();q.bb(fx,yb)});
        for(const c of cr)if(rn(0,1)<.3)cu.push(c)}
      y+=r*rn(1.15,1.45)}
    // lístky přes koruny (jeden prvek pro celý les)
    if(cu.length)add('none',.8,q=>{for(const[x,cy,c]of cu)q.curve([[x+c*.5,cy-c*.2],[x+c,cy-c*.5],[x+c*1.5,cy-c*.2]],false)});
  }
  function letna(){const P=spline([[2250,650],[2480,586],[2760,566],[3070,570]],40);
    add('paper',1.6,q=>q.poly([...P,[3070,840],[2250,840]],true,.3));
    canopy(x=>yAt(P,x),2250,3070,570,680,y=>12);
  }
  function petrin(){const P=spline([[-60,300],[120,262],[300,242],[440,256],[580,300],[720,372],[860,452],[1000,540],[1120,610],[1240,700]],30);
    add('paper',1.8,q=>q.poly([...P,[1240,1000],[-60,1000]],true,.3));
    canopy(x=>yAt(P,x),-30,1240,238,790,y=>12+(y-240)*.024);
    // Hladová zeď s cimbuřím šikmo po svahu
    const hw=[];for(let x=470;x<=950;x+=12)hw.push([x,yAt(P,x)+26+(x-470)*.2]);
    add('paper',1.3,q=>q.poly([...hw,...hw.slice().reverse().map(([x,y])=>[x,y+8])],true,.2));
    add('none',1.1,q=>{for(let i=0;i<hw.length;i+=2){const[x,y]=hw[i];q.poly([[x,y],[x,y-5],[x+6,y-5],[x+6,y]],false,.1)}});
    // zeď vede lesem: koruny před ní tu a tam zakryjí její patu
    add('paper',1,q=>{for(let i=2;i<hw.length-1;i+=4+(i%3)){const[x,y]=hw[i];bump(q,x,y+14,rn(10,14))}});
    // Petřínská rozhledna: příhradová osmiboká věž se dvěma ochozy
    const rx=300,rb=yAt(P,rx)+6,rt=rb-196;
    add('paper',1.4,q=>q.rect(rx-26,rb-16,52,20,.3));
    add('none',1.5,q=>{q.line(rx-22,rb-12,rx-6,rt+12,.2);q.line(rx+22,rb-12,rx+6,rt+12,.2);q.line(rx,rb-12,rx,rt+12,.2);
      for(let k=0;k<10;k++){const h=(rb-rt-24)/10,y0=rb-12-k*h,w0=22-16*k/10,w1=22-16*(k+1)/10;q.line(rx-w0,y0,rx+w1,y0-h,.1);q.line(rx+w0,y0,rx-w1,y0-h,.1)}});
    add('paper',1.3,q=>{q.rect(rx-17,rb-120,34,6,.1);q.rect(rx-11,rt+6,22,8,.1)});
    add('none',1.3,q=>{q.poly([[rx-8,rt+6],[rx,rt-6],[rx+8,rt+6]],false,.1);q.line(rx,rt-6,rx,rt-30,.1)});
    // rozhledna stojí mezi stromy na vrcholu: koruny před patou
    add('paper',1.1,q=>{for(const[d,r]of[[-40,13],[-14,11],[16,12],[42,13]])bump(q,rx+d,rb+10,r)});
    // lanovka na Petřín
    const fa=[660,980],fb=[470,470],ft=rr(.3,.7),fx=fa[0]+(fb[0]-fa[0])*ft,fy=fa[1]+(fb[1]-fa[1])*ft;
    add('none',1.1,q=>{q.line(fa[0],fa[1],fb[0],fb[1],.3);q.line(fa[0]+9,fa[1],fb[0]+9,fb[1],.3)});
    add('paper',1.4,q=>q.poly([[fx-16,fy+8],[fx+18,fy+8],[fx+22,fy-8],[fx-10,fy-18]],true,.2));
    add('shade',.8,q=>q.poly([[fx-8,fy],[fx+14,fy],[fx+16,fy-6],[fx-4,fy-12]],true,.1));
    return P}
  function strahov(P){const b=yAt(P,830)+50;
    for(const x of[792,828]){add('paper',1.6,q=>q.rect(x-8,b-106,16,80,.2));
      add('shade',1.3,q=>q.curve(onion(x,b-104,22,28),true));
      add('none',1.1,q=>{q.line(x,b-132,x,b-150,.1);q.line(x-4,b-143,x+4,b-143,.1);q.rect(x-3,b-94,6,10,.1)})}
    add('shade',1.5,q=>q.poly([[696,b-40],[710,b-58],[948,b-58],[962,b-40]],true,.3));
    add('paper',1.8,q=>q.rect(700,b-40,258,56,.3));
    add('none',.9,q=>{for(let x=712;x<950;x+=14){ql(q,x,b-30,x,b-22);ql(q,x,b-12,x,b-4)}});
    add('paper',1.6,q=>q.poly([[778,b-40],[778,b-66],[810,b-82],[842,b-66],[842,b-40]],true,.2));
    add('shade',.8,q=>q.poly(farch(810,b-62,6,b-44),true,.1));
    // klášter stojí na terase zapuštěné do svahu: opěrná zeď s opěráky a sklepními okénky, pod ní zahradní zídka;
    // koruny stromů pod terasou (kreslené až po budově) zakrývají patu zdí zepředu
    add('paper',1.6,q=>q.poly([[694,b+16],[966,b+16],[972,b+58],[688,b+58]],true,.2));
    add('none',.8,q=>{for(let y=b+26;y<b+56;y+=10)ql(q,690,y,970,y);for(let x=716;x<950;x+=46){ql(q,x,b+16,x-2,b+58);ql(q,x+6,b+16,x+4,b+58)}});
    add('shade',.7,q=>{for(let x=739;x<950;x+=46)q.poly(farch(x,b+28,4,b+42),true,.05)});
    add('paper',1.3,q=>q.poly([[672,b+58],[968,b+58],[970,b+67],[668,b+67]],true,.2));
    add('none',.7,q=>{for(let x=680;x<966;x+=16)ql(q,x,b+58,x,b+64)});
    // dvě řady korun (jen horní obrys, bez spodní hrany, aby nevznikl rovný pruh)
    for(const[y0,x0,st]of[[b+70,676,26],[b+84,664,30]])add('paper',1.1,q=>{for(let x=x0;x<972;x+=st*rn(.85,1.1))bump(q,x,y0+rn(-3,3),rn(11,14))});
    // Loreta: zvonice s cibulí mezi střechami Hradčan
    add('paper',1.5,q=>q.rect(952,548,18,70,.2));
    add('shade',1.3,q=>q.curve(onion(961,550,22,26),true));
    add('none',1.1,q=>{q.line(961,524,961,508,.1);q.ell(961,566,5,5,.05)});
  }
  function castleHill(){const P=spline([[900,650],[1060,618],[1200,612],[2300,612],[2600,622],[2760,662],[2900,730],[3070,800]],40);
    add('paper',1.8,q=>q.poly([...P,[3070,1000],[900,1000]],true,.3));
    return P}

  /* ---------- Pražský hrad ---------- */
  function vitus(){const NY=376,RY=262;
    // loď a chór s okny
    add('paper',2,q=>q.rect(1630,NY,540,150,.4));
    add('shade',1,q=>{for(let x=1716;x<2160;x+=44)if(Math.abs(x-1930)>64)q.poly(farch(x,NY+16,8,NY+84),true,.2)});
    // strmá střecha s kosočtverečným vzorem tašek a sanktusníkem
    add('shade',2,q=>q.poly([[1622,NY+2],[1648,RY],[2148,RY],[2184,NY+2]],true,.4));
    add('none',.9,q=>{for(let x=1668;x<2128;x+=34){ql(q,x,RY+3,x+28,NY-3);ql(q,x+28,RY+3,x,NY-3)}});
    add('paper',1.4,q=>q.poly([[2064,RY+2],[2073,RY-64],[2082,RY+2]],true,.1));
    add('none',1.2,q=>{q.line(2073,RY-64,2073,RY-78,.1);for(let k=1;k<5;k++){const y=RY-k*13;q.line(2068+k,y,2064+k,y-4,.1);q.line(2078-k,y,2082-k,y-4,.1)}});
    // opěrný systém: fiály a opěrné oblouky
    const pin=[1716,1762,1808,1854,2006,2046,2086,2126,2164];
    add('none',1.6,q=>{for(const x of pin){const h=x>1990?90:62;q.curve([[x,NY+30-h*.4],[x-12,NY-6],[x-28,NY+8]],false)}});
    add('paper',1.4,q=>{for(const x of pin){const h=x>1990?90:62;q.poly([[x-5,NY+70],[x-5,NY+30-h*.5],[x,NY+30-h],[x+5,NY+30-h*.5],[x+5,NY+70]],true,.1)}});
    add('none',.9,q=>{for(const x of pin){const h=x>1990?90:62;for(let k=1;k<4;k++){const y=NY+30-h*.5-k*h*.12;ql(q,x-4+k,y,x-8+k,y-3);ql(q,x+4-k,y,x+8-k,y-3)}}});
    // dvě štíhlé západní věže s jehlany
    for(const[x,t]of[[1602,108],[1664,122]]){const w=44,sx=x+(R()<.5?-9:9);
      add('paper',2,q=>q.rect(x-w/2,258,w,270,.3));
      add('shade',1,q=>{q.poly(farch(x-8,294,5,356),true,.1);q.poly(farch(x+8,294,5,356),true,.1);q.poly(farch(x,384,8,446),true,.1)});
      add('none',1,q=>{q.line(x-w/2,372,x+w/2,372,.2);q.line(x-w/2,456,x+w/2,456,.2)});
      add('paper',1.8,q=>q.poly([[x-w/2+4,258],[x-3,t+8],[x,t],[x+3,t+8],[x+w/2-4,258]],true,.2));
      add('none',.9,q=>{for(let k=1;k<9;k++){const u=k/9,y=258-(258-t)*u,hw=(w/2-4)*(1-u);ql(q,x-hw,y,x-hw-5,y-4);ql(q,x+hw,y,x+hw+5,y-4)}
        q.line(x,t,x,t-16,.1);q.line(x-5,t-10,x+5,t-10,.1)});
      if(free(sx,256,9,O.castle))spot('vitus',sx,252,o=>peek(sx,252,ks(o,40,600),o,.12));
      add('paper',1.6,q=>q.rect(x-w/2-4,250,w+8,12,.2));
      add('none',.8,q=>{for(let k=x-w/2;k<x+w/2+4;k+=6)ql(q,k,252,k,260)});
    }
    // hlavní jižní věž: gotický spodek, hodiny, ochoz a renesanční helmice s bání a lucernami
    const tx=1930,tw=96,gx=tx+(R()<.5?-26:26),lan=R()<.5;
    add('paper',2.2,q=>q.rect(tx-tw/2,236,tw,300,.4));
    add('none',1,q=>{q.line(tx-tw/2+9,236,tx-tw/2+9,530,.2);q.line(tx+tw/2-9,236,tx+tw/2-9,530,.2);q.line(tx-tw/2,330,tx+tw/2,330,.2)});
    add('shade',1.4,q=>q.poly(farch(tx,352,24,480),true,.2));
    add('none',1,q=>{q.line(tx-8,378,tx-8,480,.1);q.line(tx+8,378,tx+8,480,.1);q.ell(tx,368,9,9,.05);q.line(tx-24,430,tx+24,430,.1)});
    add('paper',1.6,q=>{q.ell(tx,300,16,16,.03);q.ell(tx,266,10,10,.03)});
    add('none',1.2,q=>{q.line(tx,300,tx+10,294,.1);q.line(tx,300,tx-2,288,.1);q.line(tx,266,tx+6,262,.1)});
    add('paper',2,q=>q.rect(tx-38,196,76,40,.3));
    add('shade',.9,q=>{for(let k=-2;k<=2;k++)q.poly(farch(tx+k*14,204,4,230),true,.1)});
    if(!lan&&free(gx,238,9,O.castle))spot('vitus',gx,224,o=>peek(gx,224,ks(o,40,600),o,.14));
    add('paper',1.8,q=>q.rect(tx-tw/2-8,222,tw+16,14,.3));
    add('none',.9,q=>{for(let x=tx-tw/2-2;x<tx+tw/2+6;x+=8)ql(q,x,225,x,234)});
    add('shade',2,q=>q.curve(onion(tx,198,98,58),true));
    add('none',1,q=>{for(const d of[-.5,0,.5])q.curve([[tx+d*80,196],[tx+d*70,168],[tx+d*20,146]],false)});
    add('paper',1.8,q=>q.rect(tx-16,118,32,28,.2));
    add('shade',.8,q=>{q.poly(farch(tx-7,122,4,144),true,.1);q.poly(farch(tx+7,122,4,144),true,.1)});
    if(lan&&free(tx,146,9,O.castle))spot('vitus',tx,146,o=>peek(tx,146,ks(o,40,600),o,.02));
    add('shade',1.8,q=>q.curve(onion(tx,120,52,32),true));
    add('paper',1.4,q=>q.rect(tx-7,78,14,12,.1));
    add('shade',1.4,q=>q.ell(tx,74,8,7,.05));
    add('none',1.4,q=>{q.line(tx,68,tx,34,.1);q.ell(tx,52,3,3,.1);q.line(tx-5,42,tx+5,42,.1)});
  }
  // bazilika sv. Jiří: dvě bílé románské věže za Starým královským palácem
  function george(){
    for(const[x,t]of[[2344,330],[2392,316]]){
      add('paper',1.8,q=>q.rect(x-13,t+30,26,470-t,.2));
      add('paper',1.8,q=>q.poly([[x-16,t+32],[x,t],[x+16,t+32]],true,.1));
      add('shade',.8,q=>{q.poly(farch(x-5,t+42,3,t+58),true,.1);q.poly(farch(x+5,t+42,3,t+58),true,.1)});
      add('none',1,q=>{q.line(x-13,t+66,x+13,t+66,.1);q.line(x,t,x,t-10,.1)});
    }
    const gx=2368;if(free(gx,378,9,O.castle))spot('george',gx,376,o=>peek(gx,376,ks(o,40,600),o,.1));
    add('shade',1.6,q=>q.poly([[2318,424],[2334,374],[2404,374],[2420,424]],true,.2));
  }
  function castle(){const x0=1150,x1=2290,T=470,B=626;
    // Starý královský palác (vyšší, se strmou střechou)
    add('shade',2,q=>q.poly([[2274,448],[2300,388],[2440,388],[2464,448]],true,.3));
    add('paper',2.2,q=>q.rect(2280,446,178,184,.4));
    add('shade',.9,q=>{for(let x=2294;x<2446;x+=38)for(const y of[464,510,560])qb(q,x,y,24,28)});
    add('none',.9,q=>{for(let x=2294;x<2446;x+=38)for(const y of[464,510,560]){ql(q,x+12,y,x+12,y+28);ql(q,x,y+11,x+24,y+11)}});
    // Tereziánské křídlo: nízká střecha s komíny a vlajkou, dlouhá fasáda s rizality
    const ch=[];for(let x=x0+rr(40,90);x<x1-40;x+=rr(90,150))ch.push(x);
    const fl=(x0+x1)/2+rr(-40,40);
    for(let i=0;i<3;i++){const x=rr(x0+60,x1-60);if(ch.every(c=>Math.abs(c-x)>34)&&Math.abs(x-fl)>40&&free(x,442,9,O.castle))spot('castleroof',x,440,o=>peek(x,440,ks(o,40,600),o,.1))}
    add('paper',2,q=>q.poly([[x0-8,T+4],[x0+24,440],[x1-24,440],[x1+8,T+4]],true,.3));
    add('none',.7,q=>{for(let x=x0+16;x<x1-14;x+=10)ql(q,x,T+1,x+(x<(x0+x1)/2?4:-4),443)});
    add('paper',1.4,q=>{for(const x of ch){q.rect(x-6,422,12,28,.1);q.rect(x-8,418,16,5,.1)}});
    add('none',1.6,q=>{q.line(fl,442,fl,352,.1);q.ell(fl,350,2.5,2.5,.1)});
    add('paper',1.3,q=>q.curve([[fl,358],[fl+16,352],[fl+32,360],[fl+48,354],[fl+48,380],[fl+32,386],[fl+16,378],[fl,384]],true));
    add('shade',0,q=>q.poly([[fl,358],[fl+20,371],[fl,384]],true,.1));
    add('none',.9,q=>q.curve([[fl+18,371],[fl+32,373],[fl+47,367]],false));
    add('paper',2.4,q=>q.rect(x0,T,x1-x0,B-T,.5));
    const rz=[x0+150,x0+400,(x0+x1)/2-90,(x0+x1)/2+90,x1-400,x1-150];
    add('none',1.1,q=>{q.line(x0,T+10,x1,T+10,.3);q.line(x0,T+46,x1,T+46,.2);q.line(x0,B-18,x1,B-18,.3);for(const x of rz){q.line(x,T+10,x,B-18,.2);q.line(x+6,T+10,x+6,B-18,.2)}});
    const rows=[480,514,550,586],cols=[];for(let x=x0+22;x<x1-16;x+=32)if(rz.every(z=>Math.abs(z+3-x)>12))cols.push(x);
    add('shade',.8,q=>{for(const y of rows)for(const x of cols)qb(q,x-7,y,14,y===480?14:22)});
    for(let i=0;i<5;i++){const x=pick(cols),y=pick([514,550,586]);if(free(x,y+22,9,O.castle))spot('castlewin',x,y+22,o=>peek(x,y+22,ks(o,40,600),o,.06))}
    add('paper',.8,q=>{for(const y of rows.slice(1))for(const x of cols)qb(q,x-9,y+21,18,3)});
    // opěrná zeď pod hradem
    add('paper',1.8,q=>q.rect(x0-40,B,x1-x0+120,20,.3));
    add('none',.8,q=>{for(let x=x0-30;x<x1+70;x+=26)ql(q,x,B+2,x+1,B+18)});
  }
  // Hradčanské náměstí: Schwarzenberský palác se štíty a sgrafity, domky
  function hradcanyWest(){const x0=1016,x1=1150,T=544,B=636;
    add('shade',1.4,q=>q.poly([[900,600],[914,582],[1010,582],[1016,600]],true,.2));
    add('paper',1.6,q=>q.rect(904,598,112,40,.2));
    add('shade',.7,q=>{for(let x=912;x<1010;x+=16)q.rect(x,606,7,10,.05)});
    add('paper',1.8,q=>{for(let k=0;k<4;k++){const a=x0+k*33.5;q.poly([[a,T+2],[a,T-14],[a+6,T-14],[a+6,T-22],[a+13,T-22],[a+16.7,T-32],[a+20,T-22],[a+27,T-22],[a+27,T-14],[a+33.5,T-14],[a+33.5,T+2]],true,.1)}});
    add('paper',2,q=>q.rect(x0,T,x1-x0,B-T,.3));
    add('none',.55,q=>{const h=B-T-10;for(let x=x0-h;x<x1;x+=11){let a=x,b=x+h,ya=T+6,yb=T+6+h;if(a<x0){ya+=x0-a;a=x0}if(b>x1){yb-=b-x1;b=x1}if(b>a)q.line(a,ya,b,yb,.1);
      let c=x+h,d=x,yc=T+6,yd=T+6+h;if(c>x1){yc+=c-x1;c=x1}if(d<x0){yd-=x0-d;d=x0}if(c>d)q.line(c,yc,d,yd,.1)}});
    add('shade',.8,q=>{for(let x=x0+10;x<x1-8;x+=22){q.rect(x,T+14,10,14,.05);q.rect(x,T+46,10,14,.05)}});
  }
  function eastEnd(){
    // Rožmberský a Lobkovický palác
    add('shade',1.6,q=>q.poly([[2452,502],[2464,480],[2640,480],[2652,502]],true,.2));
    add('paper',2,q=>q.rect(2456,500,190,150,.3));
    add('shade',.8,q=>{for(let x=2470;x<2636;x+=24)for(const y of[514,548,582])qb(q,x,y,10,16)});
    // Daliborka (za) a Černá věž
    add('paper',2,q=>q.rect(2716,540,48,130,.3));
    add('none',.8,q=>{q.curve([[2716,560],[2740,566],[2764,560]],false);q.curve([[2716,620],[2740,626],[2764,620]],false)});
    add('shade',.9,q=>q.poly(farch(2740,566,7,592),true,.1));
    if(free(2740,592,9,O.castle))spot('daliborka',2740,592,o=>peek(2740,592,ks(o,40,600),o,.08));
    add('paper',.8,q=>q.rect(2730,591,20,3,.05));
    add('shade',1.8,q=>q.poly([[2708,544],[2740,486],[2772,544]],true,.2));
    add('paper',1.8,q=>q.poly([[2640,610],[2800,640],[2800,684],[2640,670]],true,.2));
    add('paper',2,q=>q.rect(2647,512,44,158,.3));
    add('shade',.9,q=>q.poly(farch(2669,530,8,556),true,.1));
    if(free(2669,556,9,O.castle))spot('blacktower',2669,556,o=>peek(2669,556,ks(o,40,600),o,.08));
    add('paper',.8,q=>q.rect(2658,555,22,3,.05));
    add('none',.8,q=>{for(let y=580;y<660;y+=14)q.line(2647,y,2691,y,.2)});
    add('shade',1.8,q=>q.poly([[2641,514],[2669,462],[2697,514]],true,.2));
    // Staré zámecké schody se zdí a Svatováclavská vinice
    add('paper',1.6,q=>q.poly([[2690,660],[3070,826],[3070,842],[2690,676]],true,.2));
    add('none',.9,q=>{for(let x=2700;x<3060;x+=10){const y=660+(x-2690)*.437;ql(q,x,y+16,x+6,y+19)}});
    add('none',1,q=>{for(let r=0;r<5;r++)for(let x=2740+r*16;x<3050;x+=13){const y=700+(x-2690)*.437+r*18;ql(q,x,y,x,y-7);ql(q,x-3,y-5,x+3,y-5)}});
    add('paper',1.4,q=>q.rect(2890,748,54,34,.2));
    add('shade',1.2,q=>q.poly([[2884,750],[2917,728],[2950,750]],true,.1));
  }
  // zahrady pod hradem: terasy s balustrádou, stromky, schodiště a altán
  function gardens(){const lv=[670,706,742];let gz=Math.floor(R()*3),gzd=false;
    for(let li=0;li<3;li++){const y=lv[li],y0=li?lv[li-1]+14:640;
      // zeleň terasy (koruny v řadách), pak zeď s balustrádou; kočka vykukuje přes balustrádu
      canopy(x=>x<1170||x>2670?1e4:y0,1170,2670,y0,y-8,()=>rr(8,11));
      const sg=[];
      for(let x=rr(1200,1300);x<2600;){const w=rr(170,320);if(R()<.28){x+=w*.6;continue}
        const gazebo=!gzd&&li===gz&&w>220;sg.push([x,w,R()<.45]);
        if(gazebo){gzd=true;const gx=x+w*rr(.3,.7);
          add('paper',1.6,q=>q.rect(gx-24,y-30,48,30,.2));
          add('shade',.9,q=>{q.poly(farch(gx-14,y-24,5,y),true,.1);q.poly(farch(gx,y-26,6,y),true,.1);q.poly(farch(gx+14,y-24,5,y),true,.1)});
          add('shade',1.4,q=>q.poly(dome(gx,y-30,28,20,8),true,.1));
          add('none',1.1,q=>{q.line(gx,y-50,gx,y-62,.1);q.ell(gx,y-64,2,2,.1)});
          if(free(gx,y,9,O.garden))spot('gazebo',gx,y,o=>peek(gx,y-2,ks(o,40,700),o,.02))}
        else{const sx=x+rr(20,w-20);if(free(sx,y+2,9,O.garden))spot('terrace',sx,y,o=>peek(sx,y,ks(o,40,700),o,.12))}
        x+=w+rr(14,40)}
      // balustráda (madlo a kuželky), zeď terasy a schodiště
      add('paper',1.3,q=>{for(const[x,w]of sg)qb(q,x,y,w,7)});
      add('none',.8,q=>{for(const[x,w,st]of sg){for(let k=x+5;k<x+w;k+=7)ql(q,k,y+7,k,y+16);if(st)for(let k=0;k<5;k++)ql(q,x+w+4+k*5,y+2+k*6,x+w+14+k*5,y+2+k*6)}});
      add('paper',1.5,q=>{for(const[x,w]of sg)qb(q,x-2,y+16,w+4,14)})}
  }

  /* ---------- Malá Strana ---------- */
  // řada domů: {x, w, b pata, fh výška fasády, rh střechy, rt typ střechy (0 valba, 1 štít, 2 mansarda, 3 sedlo), sc, o vrstva}.
  // Domy v řadě se nepřekrývají, proto se kreslí po vrstvách najednou (fasády, okna, střechy, vikýře, komíny) – šetří prvky.
  const box4=(q,x,y,w,h,j)=>q.poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],true,j);
  // příprava řady: geometrie domů, střech, vikýřů a komínů; komíny a vikýře se přidají do zákrytů,
  // aby okna v řadách za nimi věděla, co je zakryje
  function prepRow(hs){const LO=OCC.filter(k=>k.o>hs[0].o);
    const G=hs.map(h=>{const{x,w,b,fh,sc}=h,top=b-fh,ww=Math.max(16,28*sc),wh=ww*1.45,fl=Math.max(wh+12,62*sc),
        nf=Math.max(1,Math.floor((fh-14*sc)/fl)),nc=Math.max(1,Math.floor(w/(ww*2.1))),sp=w/nc,wy0=top+12*sc,win=[];
      // okna schovaná celá za domy z pozdějších řad se nekreslí
      const LH=LO.filter(k=>k.x1>x&&k.x0<x+w&&k.y1>top);
      for(let f=0;f<nf;f++)for(let c=0;c<nc;c++){const a=x+sp*(c+.5),y=wy0+f*fl;
        if(!LH.some(k=>k.x0<=a-ww/2&&k.x1>=a+ww/2&&k.y0<=y&&k.y1>=y+wh))win.push([a,y])}
      if(!win.length)win.push([x+sp*.5,wy0]);
      return Object.assign({top,cx:x+w/2,ww,wh,fl,nf,nc,wy0,win,dark:R()<.62,dec:R(),r0:hr(40,b)},h)});
    // střechy
    for(const g of G){const{x,w,top,rh,rt,sc}=g;
      if(rt===1){g.gh=rh*1.25;g.gw=Math.max(16,g.ww)}
      else if(rt===2){const k=rh*.62;g.rp=[[[x-3,top+2],[x+5*sc,top-k],[x+w-5*sc,top-k],[x+w+3,top+2]],[[x+5*sc,top-k],[x+w*.22,top-rh],[x+w*.78,top-rh],[x+w-5*sc,top-k]]];g.ridge={x0:x+w*.22,x1:x+w*.78,y:top-rh,db:top-k*.3}}
      else{const i=rt===0?Math.min(rh*.9,w*.3):4*sc;g.rp=[[[x-4*sc,top+2],[x+i,top-rh],[x+w-i,top-rh],[x+w+4*sc,top+2]]];g.ridge={x0:x+i,x1:x+w-i,y:top-rh,db:top-rh*.25}}}
    const DM=[];
    for(const g of G){if(!g.ridge)continue;const r=g.ridge,dw=Math.max(20,26*g.sc),dh=dw*1.15,span=r.x1-r.x0,nd=span>dw*2?Math.floor(R()*Math.min(3,span/(dw*1.7))):0;g.ds=[];g.dw=dw;
      for(let k=0;k<nd;k++){const dx=r.x0+span*(k+.5)/nd;g.ds.push(dx);DM.push({g,dx,dw,dh,db:r.db,round:R()<.4})}}
    const CH=[];
    for(const g of G){if(!g.ridge)continue;const r=g.ridge,cw=Math.max(16,20*g.sc),nch=1+Math.floor(R()*2),span=r.x1-r.x0;g.cs=[];
      for(let k=0;k<nch;k++){const a=r.x0+span*rr(.05,.95);if(g.ds.every(d=>Math.abs(d-a)>g.dw)&&g.cs.every(c=>Math.abs(c-a)>cw*2)){g.cs.push(a);CH.push([a,r.y-8-14*g.sc,cw,r.y+g.rh*.3,g])}}}
    for(const{dx,dw,dh,db,g}of DM)occ(dx-dw/2-3,dx+dw/2+3,db-dh*1.12,db,g.o);
    for(const[a,t,cw,bt,g]of CH)occ(a-cw/2-2,a+cw/2+2,t-4,bt,g.o);
    return{G,DM,CH}}
  function houseRow({G,DM,CH}){
    add('paper',2,q=>{for(const g of G)qb(q,g.x,g.top,g.w,g.fh+6)});
    // členění fasády: římsy, lizény nebo nárožní bosáž; okenní kříže a frontony
    add('none',.8,q=>{for(const g of G){const{x,w,top,b,sc,dec,nf,fl,wy0,ww,wh}=g;
      if(dec<.4)for(let f=1;f<nf;f++)ql(q,x,wy0+f*fl-7*sc,x+w,wy0+f*fl-7*sc,.2);
      else if(dec<.7){ql(q,x+5*sc,top+4,x+5*sc,b,.2);ql(q,x+w-5*sc,top+4,x+w-5*sc,b,.2)}
      else for(let y=top+6;y<b;y+=10*sc+4){ql(q,x,y,x+7*sc,y,.1);ql(q,x+w,y,x+w-7*sc,y,.1)}
      ql(q,x-2,top+3*sc,x+w+2,top+3*sc,.2);
      if(dec>.25&&dec<.55)for(const[a,y]of g.win)if(y===wy0)q.poly([[a-ww/2-2,y-3],[a,y-3-ww*.35],[a+ww/2+2,y-3]],false,.1)}});
    add('shade',.9,q=>{for(const g of G)for(const[a,y]of g.win)qb(q,a-g.ww/2,y,g.ww,g.wh,.15)});
    add('none',.6,q=>{for(const g of G)for(const[a,y]of g.win){ql(q,a,y+2,a,y+g.wh-2,.1);ql(q,a-g.ww/2+1,y+g.wh*.38,a+g.ww/2-1,y+g.wh*.38,.1)}});
    for(const g of G){const tw=g.win.filter(w=>w[1]===g.wy0);if(R()<.6&&tw.length){const[a,y]=tw[Math.floor(R()*tw.length)],cy=y+g.wh,b=g.b;if(free(a,cy,g.r0,g.o)){g.sw=[a,y];spot('mswin',a,cy,o=>peek(a,cy,ks(o,40,b),o,.08))}}}
    add('none',1.2,q=>{for(const g of G)for(const[a,y]of g.win)ql(q,a-g.ww/2-2,y+g.wh+1,a+g.ww/2+2,y+g.wh+1,.05)});
    if(G.some(g=>g.sw))add('paper',.8,q=>{for(const g of G)if(g.sw){const[a,y]=g.sw;qb(q,a-g.ww/2-2,y+g.wh,g.ww+4,3,.05)}});
    add('shade',1.7,q=>{for(const g of G)if(g.rt===1)qp(q,[[g.x-3,g.top+2],[g.cx,g.top-g.gh-6],[g.x+g.w+3,g.top+2]]);else if(g.dark)for(const p of g.rp)qp(q,p)});
    add('paper',1.7,q=>{for(const g of G)if(g.rt!==1&&!g.dark)for(const p of g.rp)qp(q,p)});
    add('none',.6,q=>{for(const g of G)if(g.rt!==1&&!g.dark){const{x,w,top,rh,sc}=g;for(let k=1;k<4;k++){const y=top-rh*k/4;for(let a=x+w*.1;a<x+w*.9;a+=9*sc+3)ql(q,a,y,a+2,y+rh/4-2,.05)}}});
    // barokní štíty s okénkem
    const GB=G.filter(g=>g.rt===1);
    add('paper',1.8,q=>{for(const g of GB){const{x,w,top,gh,cx}=g;qp(q,[[x,top+6],[x,top-gh*.26],[x+w*.12,top-gh*.26],[x+w*.14,top-gh*.42],[x+w*.26,top-gh*.5],[x+w*.3,top-gh*.8],[cx-w*.1,top-gh*.8],[cx-w*.08,top-gh*.9],[cx,top-gh],[cx+w*.08,top-gh*.9],[cx+w*.1,top-gh*.8],[x+w*.7,top-gh*.8],[x+w*.74,top-gh*.5],[x+w*.86,top-gh*.42],[x+w*.88,top-gh*.26],[x+w,top-gh*.26],[x+w,top+6]])}});
    add('none',.8,q=>{for(const g of GB){const{x,w,top,gh}=g;q.curve([[x+w*.12,top-gh*.3],[x+w*.2,top-gh*.34],[x+w*.24,top-gh*.46]],false);q.curve([[x+w*.88,top-gh*.3],[x+w*.8,top-gh*.34],[x+w*.76,top-gh*.46]],false);ql(q,x,top-gh*.26+3,x+w*.12,top-gh*.26+3);ql(q,x+w*.88,top-gh*.26+3,x+w,top-gh*.26+3);ql(q,x+w*.3,top-gh*.8+3,x+w*.7,top-gh*.8+3)}});
    add('shade',.9,q=>{for(const g of GB){const gy=g.top-g.gh*.62;qp(q,farch(g.cx,gy,g.gw/2,gy+g.gw*1.2))}});
    for(const g of GB){const cx=g.cx,gb=g.top-g.gh*.62+g.gw*1.2,b=g.b;if(R()<.7&&free(cx,gb,g.r0,g.o))spot('gable',cx,gb,o=>peek(cx,gb,ks(o,40,b),o,.06))}
    add('paper',.8,q=>{for(const g of GB){const gb=g.top-g.gh*.62+g.gw*1.2;qb(q,g.cx-g.gw/2-2,gb,g.gw+4,3,.05)}});
    // vikýře
    add('paper',1.3,q=>{for(const{dx,dw,dh,db,round}of DM){qb(q,dx-dw/2,db-dh*.72,dw,dh*.72,.1);if(round)q.poly(dome(dx,db-dh*.72,dw/2+3,dh*.4,6),true,.1);else q.poly([[dx-dw/2-3,db-dh*.72],[dx,db-dh*1.12],[dx+dw/2+3,db-dh*.72]],true,.1)}});
    add('shade',.7,q=>{for(const{dx,dw,dh,db}of DM)qb(q,dx-dw/2+3,db-dh*.62,dw-6,dh*.5,.05)});
    for(const m of DM){const{dx,dh,db,g}=m,wb=db-dh*.12,b=g.b;if(R()<.5&&free(dx,wb,g.r0,g.o)){m.sp=1;spot('dormer',dx,wb,o=>peek(dx,wb,ks(o,40,b),o,.06))}}
    if(DM.some(m=>m.sp))add('paper',.7,q=>{for(const{dx,dw,dh,db,sp}of DM)if(sp)qb(q,dx-dw/2+1,db-dh*.12,dw-2,2.5,.05)});
    // komíny (kočka vykukuje z komína) a kočka na hřebeni
    for(const[a,t,,, g]of CH){const b=g.b;if(R()<.45&&free(a,t,g.r0,g.o))spot('chimney',a,t,o=>peek(a,t,ks(o,40,b),o,.12))}
    add('paper',1.3,q=>{for(const[a,t,cw,bt]of CH){qb(q,a-cw/2,t,cw,bt-t,.1);qb(q,a-cw/2-2,t-4,cw+4,5,.05)}});
    for(const g of G){if(!g.ridge)continue;const r=g.ridge,span=r.x1-r.x0,b=g.b;if(span>34&&R()<.35){const lx=r.x0+span*rr(.25,.75),ls=Math.max(22,40*D(b));
      if(g.cs.every(c=>Math.abs(c-lx)>ls*.7)&&free(lx,r.y-ls*.3,ls*.33,g.o))spot('msroof',lx,r.y,o=>loafCat(lx,r.y+1,ks(o,40,b),o))}}
  }
  // barokní kostelní věž (sv. Tomáš) mezi domy
  function churchTower(x,b,h,sc){const w=46*sc*1.6,t=b-h;
    add('paper',2,q=>q.rect(x-w/2,t,w,h,.3));
    add('none',.9,q=>{q.line(x-w/2,t+h*.3,x+w/2,t+h*.3,.2);q.line(x-w/2,t+h*.62,x+w/2,t+h*.62,.2)});
    add('shade',.9,q=>{q.poly(farch(x,t+12,w*.18,t+h*.26),true,.1);q.ell(x,t+h*.44,w*.2,w*.2,.05)});
    add('paper',1.4,q=>q.ell(x,t+h*.44,w*.14,w*.14,.03));
    add('shade',1.8,q=>q.curve(onion(x,t,w*1.3,w*1.2),true));
    add('paper',1.3,q=>q.rect(x-w*.18,t-w*1.5,w*.36,w*.32,.1));
    add('shade',1.3,q=>q.curve(onion(x,t-w*1.18,w*.6,w*.5),true));
    add('none',1.2,q=>{q.line(x,t-w*1.66,x,t-w*2.1,.1);q.line(x-4,t-w*1.95,x+4,t-w*1.95,.1)});
  }
  // kostel sv. Mikuláše: kopule na tamburu s lucernou a samostatná zvonice
  function nicholas(){const cx=1040,bx=1214;
    add('paper',2,q=>q.rect(cx-160,736,300,190,.3));
    add('shade',2,q=>q.poly([[cx-170,740],[cx-140,700],[cx+120,700],[cx+150,740]],true,.3));
    add('paper',2.2,q=>q.rect(cx-64,630,128,84,.3));
    add('shade',.9,q=>{for(let k=-2;k<=2;k++)q.poly(farch(cx+k*24,650,6,692),true,.1)});
    add('none',1,q=>{for(let k=-2;k<=1;k++){q.line(cx+k*24+12,638,cx+k*24+12,708,.1)}q.line(cx-64,640,cx+64,640,.2);q.line(cx-66,700,cx+66,700,.2)});
    add('shade',2.2,q=>q.poly(dome(cx,634,76,84,16),true,.2));
    add('none',1.1,q=>{for(const a of[-.66,-.33,.33,.66])q.curve([[cx+a*76,634],[cx+a*66,590],[cx+a*18,554]],false)});
    add('paper',1.8,q=>q.rect(cx-15,520,30,34,.2));
    add('shade',.8,q=>{q.poly(farch(cx-7,526,3,548),true,.1);q.poly(farch(cx+7,526,3,548),true,.1)});
    add('shade',1.6,q=>q.curve(onion(cx,522,36,24),true));
    add('none',1.4,q=>{q.line(cx,498,cx,474,.1);q.line(cx-5,486,cx+5,486,.1)});
    add('paper',1.6,q=>q.rect(cx-82,630,164,8,.1));
    // zvonice
    add('paper',2.2,q=>q.poly([[bx-26,920],[bx-22,660],[bx+22,660],[bx+26,920]],true,.3));
    add('none',.9,q=>{q.line(bx-24,780,bx+24,780,.2);q.line(bx-25,850,bx+25,850,.2)});
    add('shade',1,q=>q.poly(farch(bx,672,10,714),true,.1));
    if(free(bx,714,9,O.nic))spot('nicholas',bx,714,o=>peek(bx,714,ks(o,40,700),o,.06));
    add('paper',1,q=>q.rect(bx-13,713,26,3,.05));
    add('paper',1.6,q=>q.ell(bx,746,12,12,.03));
    add('none',1,q=>{q.line(bx,746,bx+7,742,.1);q.line(bx,746,bx,738,.1)});
    add('paper',1.8,q=>q.rect(bx-28,648,56,12,.2));
    add('shade',1.8,q=>q.curve(onion(bx,648,56,50),true));
    add('paper',1.4,q=>q.rect(bx-9,588,18,14,.1));
    add('shade',1.4,q=>q.curve(onion(bx,590,26,22),true));
    add('none',1.4,q=>{q.line(bx,570,bx,546,.1);q.line(bx-5,556,bx+5,556,.1)});
  }
  // Malostranské mostecké věže: vyšší gotická (vpravo), brána a nižší Juditina (vlevo)
  // Malostranské mostecké věže: vyšší gotická (vpravo) s boční stěnou ve stínu, brána a nižší Juditina věž (vlevo)
  function msTowers(){const b=972,x=842,w=86,t=708,sw=22,sd=12,xr=x+w/2;
    // boční (východní) stěna a boční plocha střechy ve stínu
    add('shade',1.8,q=>qp(q,[[xr,t],[xr+sw,t-sd],[xr+sw,b-sd],[xr,b]]));
    add('shade',1.8,q=>qp(q,[[xr+4,t+2],[x+sw*.5,t-120-sd*.5],[xr+sw+4,t-sd+2]]));
    add('paper',2.2,q=>q.rect(x-w/2,t,w,b-t,.3));
    add('none',1,q=>{for(const y of[t+14,t+110,t+200]){q.line(x-w/2,y,xr,y,.2);ql(q,xr,y,xr+sw,y-sd)}for(let k=-1;k<=1;k++)q.poly(farch(x+k*24,t+20,9,t+56),false,.1)});
    add('shade',1,q=>{q.poly(farch(x-18,t+122,8,t+174),true,.1);q.poly(farch(x+18,t+122,8,t+174),true,.1);q.rect(x-6,t+214,12,20,.1)});
    const wx=x+(R()<.5?-18:18);if(free(wx,t+174,9,O.mst))spot('bridgetower',wx,t+174,o=>peek(wx,t+174,ks(o,40,900),o,.06));
    add('paper',.8,q=>{q.rect(x-28,t+173,20,3,.05);q.rect(x+8,t+173,20,3,.05)});
    // přední plocha střechy (světlejší, břidlice) s vikýřky, nárožní věžičky
    add('paper',2,q=>q.poly([[x-w/2-4,t+2],[x+sw*.5,t-120-sd*.5],[xr+4,t+2]],true,.3));
    add('none',.7,q=>{for(let k=1;k<6;k++){const y=t-k*20,f=k/6;ql(q,x-w/2+f*(w/2+sw*.5)-2,y,xr-f*(w/2-sw*.5)+2,y)}});
    add('paper',1.2,q=>{for(const d of[-14,16])qp(q,[[x+d-6,t-24],[x+d-6,t-36],[x+d,t-44],[x+d+6,t-36],[x+d+6,t-24]])});
    add('shade',.6,q=>{for(const d of[-14,16])qb(q,x+d-3,t-35,6,8)});
    add('paper',1.4,q=>{for(const c of[x-w/2,xr,xr+sw]){const yy=c>xr?t-sd:t;qp(q,[[c-5,yy+6],[c-5,yy-16],[c+2,yy-50],[c+9,yy-16],[c+9,yy+6]])}});
    add('none',1.4,q=>{q.line(x+sw*.5,t-126,x+sw*.5,t-150,.1);q.ell(x+sw*.5,t-136,3,3,.1)});
    // brána s cimbuřím
    add('paper',2,q=>q.rect(758,b-104,50,104,.2));
    add('none',1,q=>{for(let k=0;k<4;k++)q.rect(760+k*12,b-114,7,10,.05)});
    add('shade',1.2,q=>q.poly(farch(783,b-82,15,b),true,.1));
    // nižší Juditina věž s boční stěnou
    const lx=736,lw=64,lt=848,ls=12;
    add('shade',1.6,q=>qp(q,[[lx+lw/2,lt],[lx+lw/2+ls,lt-8],[lx+lw/2+ls,b-112],[lx+lw/2,b-104]]));
    add('paper',2.2,q=>q.rect(lx-lw/2,lt,lw,b-lt,.3));
    add('shade',.9,q=>{q.rect(lx-6,lt+26,12,18,.1);q.rect(lx-20,lt+70,10,14,.1)});
    add('shade',1.6,q=>qp(q,[[lx+lw/2-14,lt-36],[lx+lw/2+ls-8,lt-42],[lx+lw/2+ls+6,lt-6],[lx+lw/2+6,lt+2]]));
    add('paper',1.8,q=>q.poly([[lx-lw/2-6,lt+2],[lx-lw/2+14,lt-36],[lx+lw/2-14,lt-36],[lx+lw/2+6,lt+2]],true,.2));
    add('none',.8,q=>{for(let k=1;k<4;k++){const y=lt-k*9;q.line(lx-lw/2+k*5,y,lx+lw/2-k*5,y,.1)}});
  }

  /* ---------- Vltava, Kampa, Karlův most ---------- */
  function river(){
    add('paper',0,q=>qb(q,-10,1000,W+20,500));
    add('none',.9,q=>{for(let i=0;i<200;i++){const y=rr(1006,1480),s=D(y),x=rr(-10,W),l=(9+R()*16)*s;q.curve([[x-l,y],[x-l*.5,y-3*s],[x,y],[x+l*.5,y+2*s],[x+l,y]],false)}});
    add('none',.8,q=>{for(let i=0;i<60;i++){const x=rr(0,W),y=rr(1008,1034);ql(q,x,y,x+rr(10,30),y)}});
    add('paper',1.6,q=>q.rect(-10,992,W+20,12,.2));
    add('none',.7,q=>{for(let x=10;x<W;x+=30)ql(q,x,993,x,1003)});
    // Mánesův most v dálce
    add('paper',1.4,q=>q.rect(2230,1006,540,10,.1));
    add('shade',1,q=>{for(let k=0;k<4;k++){const a=2244+k*132;q.poly([[a,1036],[a,1024],[a+30,1017],[a+86,1017],[a+116,1024],[a+116,1036]],true,.1)}});
    add('none',.9,q=>{for(let k=0;k<5;k++)q.line(2240+k*132,1016,2240+k*132,1036,.05)});
  }
  function swan(x,y,d,s){
    add('paper',1.5,q=>{q.curve([[x-d*22*s,y-4*s],[x-d*26*s,y-16*s],[x-d*10*s,y-14*s],[x+d*14*s,y-12*s],[x+d*18*s,y-2*s],[x,y+2*s]],true);
      q.curve([[x+d*10*s,y-12*s],[x+d*16*s,y-30*s],[x+d*10*s,y-42*s],[x+d*16*s,y-46*s],[x+d*20*s,y-44*s],[x+d*15*s,y-40*s],[x+d*20*s,y-28*s],[x+d*16*s,y-10*s]],true)});
    add('ink',0,q=>q.poly([[x+d*20*s,y-45*s],[x+d*27*s,y-42*s],[x+d*20*s,y-41*s]],true,.1));
    add('none',.8,q=>{q.curve([[x-d*16*s,y-8*s],[x-d*4*s,y-12*s],[x+d*6*s,y-9*s]],false);q.line(x-d*26*s,y+2*s,x+d*24*s,y+2*s,.2)});
  }
  function ducks(x,y,s){const p=[];for(let k=0;k<3;k++)p.push([x+k*26*s+R()*8,y+R()*6,R()<.5?-1:1]);
    add('paper',1.2,q=>{for(const[a,b,d]of p){q.ell(a,b-5*s,10*s,5*s,.05);q.ell(a+d*8*s,b-12*s,4*s,4*s,.05)}});
    add('ink',0,q=>{for(const[a,b,d]of p)q.poly([[a+d*11*s,b-13*s],[a+d*16*s,b-12*s],[a+d*11*s,b-10*s]],true,.1)});
  }
  function kampa(KT,MX){
    add('paper',2,q=>q.rect(-10,1034,800,28,.3));
    add('none',.9,q=>{ql(q,-10,1046,790,1046);for(let x=10;x<780;x+=34)ql(q,x,1034,x+2,1062)});
    // mlýnské kolo na Čertovce s mlýnicí
    const mw=R()<.5;
    add('paper',2,q=>q.rect(MX+10,962,96,74,.3));
    add('shade',1.6,q=>q.poly([[MX+4,966],[MX+30,936],[MX+86,936],[MX+112,966]],true,.2));
    add('shade',.9,q=>q.rect(MX+60,982,20,24,.1));
    if(!mw&&free(MX+70,1006,hr(40,1040),O.kampa))spot('mill',MX+70,1006,o=>peek(MX+70,1006,ks(o,40,1040),o,.06));
    add('paper',.8,q=>q.rect(MX+58,1005,24,3,.05));
    add('paper',1.8,q=>q.ell(MX,1022,40,40,.02));
    add('none',1.2,q=>{q.ell(MX,1022,32,32,.02);q.ell(MX,1022,7,7,.05);for(let k=0;k<8;k++){const a=k/8*PI*2;q.line(MX+Math.cos(a)*7,1022+Math.sin(a)*7,MX+Math.cos(a)*40,1022+Math.sin(a)*40,.1)}
      for(let k=0;k<16;k++){const a=k/16*PI*2;q.line(MX+Math.cos(a)*40,1022+Math.sin(a)*40,MX+Math.cos(a+.18)*48,1022+Math.sin(a+.18)*48,.1)}});
    add('paper',1.4,q=>q.rect(MX-54,1050,112,14,.1));
    add('none',.9,q=>{for(let k=0;k<4;k++)q.curve([[MX-48+k*26,1056],[MX-40+k*26,1052],[MX-30+k*26,1056]],false)});
    if(mw&&free(MX,982,hr(40,1040),O.kampa))spot('mill',MX,982,o=>sitCat(MX,983,ks(o,40,1040),o));
    // kaštany na Kampě
    for(const t of KT){const{x,r}=t,cy=1034-30-r*.7,bl=[];
      for(let i=0;i<6;i++){const a=i/6*PI*2+rr(-.3,.3);bl.push([x+Math.cos(a)*r*.5,cy+Math.sin(a)*r*.4,r*rr(.45,.6)])}bl.push([x,cy,r*.6]);bl.sort((a,b)=>a[1]-b[1]);
      add('paper',1.8,q=>q.poly([[x-6,1036],[x-4,cy+r*.3],[x+4,cy+r*.3],[x+6,1036]],true,.2));
      for(const[a,b,rr2]of bl)add('paper',1.6,q=>qe(q,a,b,rr2,rr2*.9,11));
      add('none',.9,q=>{for(let i=0;i<14;i++){const a=R()*PI*2,d=R()*r*.7;const px=x+Math.cos(a)*d,py=cy+Math.sin(a)*d*.7;q.curve([[px-5,py],[px,py-4],[px+5,py]],false)}});
      const hx=x+rr(-.3,.3)*r,hy=cy+rr(-.25,.2)*r;
      if(t.cat&&free(hx,hy+9,9,O.kampa))spot('kampa',hx,hy,o=>{const hr2=Math.max(22,ks(o,48,1040))*.4;head(hx,hy,hr2,o);reg(o,hx,hy-hr2*.3,hr2*1.3)})}
  }
  // socha světce na zábradlí (silueta šrafami); v: 0 s křížem a svatozáří, 1 biskup, 2 sousoší, 3 se zdviženou rukou
  // sochy světců na zábradlí (siluety šrafami), všechny sochy jedné strany mostu v jednom prvku.
  // S = [[x, pata, měřítko, varianta]]; v: 0 s křížem a svatozáří, 1 biskup, 2 sousoší, 3 se zdviženou rukou
  function saints(S,far){
    add('shade',far?1:1.3,q=>{for(const[x,b,s,v]of S){const P=(a,c)=>[x+a*s,b-c*s];
      if(v===2){q.poly([P(-22,0),P(4,0),P(2,50),P(-4,68),P(-16,68),P(-20,50)],true,.2);qe(q,...P(-10,77),7*s,8*s);q.poly([P(6,0),P(24,0),P(22,26),P(12,36),P(6,26)],true,.2);qe(q,...P(16,42),6*s,6*s)}
      else if(v===5){q.poly([P(-3,0),P(3,0),P(3,112),P(-3,112)],true,.1);q.poly([P(-20,88),P(20,88),P(20,94),P(-20,94)],true,.1);q.poly([P(-26,0),P(-12,0),P(-13,40),P(-22,40)],true,.1);qe(q,...P(-17,46),5*s,6*s);q.poly([P(12,0),P(26,0),P(25,36),P(14,36)],true,.1);qe(q,...P(19,42),5*s,6*s)}
      else{q.poly([P(-14,0),P(14,0),P(10,50),P(11,70),P(-11,70),P(-10,50)],true,.2);qe(q,...P(0,79),7.5*s,8.5*s);
        if(v===1)q.poly([P(-6,86),P(6,86),P(4,98),P(0,103),P(-4,98)],true,.1);
        if(v===4){q.poly([P(8,48),P(20,50),P(20,62),P(10,64)],true,.1);qe(q,...P(15,68),5*s,5*s)}}}});
    if(far)return;
    add('none',1.4,q=>{for(const[x,b,s,v]of S){const P=(a,c)=>[x+a*s,b-c*s];
      if(v===0){q.line(...P(-12,34),...P(9,84),.1);q.line(...P(-5,70),...P(7,64),.1);qe(q,...P(0,84),13*s,4.5*s)}
      else if(v===1){q.line(...P(17,0),...P(17,96),.1);q.curve([P(17,96),P(20,104),P(12,106),P(12,100)],false)}
      else if(v===2){q.curve([P(20,30),P(34,42),P(28,50)],false);qe(q,...P(0,-2),26*s,4*s)}
      else if(v===3){q.line(...P(8,62),...P(20,92),.1);q.curve([P(-8,58),P(-20,70),P(-16,90),P(-12,96)],false)}
      else if(v===4){qe(q,...P(0,86),11*s,4*s);q.curve([P(-10,40),P(0,46),P(10,40)],false)}
      else{qe(q,...P(0,-2),30*s,4*s);qe(q,...P(0,104),9*s,9*s)}}});
    const st=S.filter(t=>t[3]===0||t[3]===4);
    if(st.length)add('ink',0,q=>{for(const[x,b,s,v]of st)for(let k=0;k<5;k++){const a=PI+k/4*PI;qe(q,x+Math.cos(a)*(v?11:13)*s,b-(v?86:84)*s+Math.sin(a)*4.5*s,1.8,1.8,6)}});
  }
  // Karlův most: severní zábradlí se sochami (tloušťka mostovky), lidé a kočky nad jižním zábradlím,
  // jižní čelo s římsou a kvádry, 16 plochých segmentových oblouků s průhledem pod mostem, mohutné pilíře
  // s opěráky až k římse a kamennými ledolamy přirostlými k patě, sochy na podstavcích a lucerny
  function bridge(){const N=32,P=[],PX=[],NS=[],SS=[],SK=.75;for(let i=0;i<=NA;i++)PX.push(BP(i/NA)[0]);const px=i=>PX[i];
    for(let k=0;k<=N;k++)P.push(BP(k/N));
    const at=dy=>P.map(([x,y],j)=>[x,y+dy*bs(j/N)]);                  // čára rovnoběžná se zábradlím (dy v měřítku)
    const sv=[];for(let i=0;i<=NA;i++)sv.push(Math.floor(R()*6));
    // severní zábradlí za mostovkou (je vidět šířka mostu) a menší sochy na něm
    add('paper',1.3,q=>q.poly([...at(-15),...at(-4).reverse()],true,.2));
    add('none',.8,q=>q.poly(at(-10),false,.2));
    for(let i=1;i<NA;i++){const s=bs(i/NA),x=px(i)+6*s,y=parY(x)-15*s;NS.push([x,y,s])}
    add('paper',1,q=>{for(const[x,y,s]of NS)qb(q,x-8*s,y-20*s,16*s,22*s)});
    saints(NS.map(([x,y,s],i)=>[x,y-20*s,s*.85,(sv[i+1]+3)%6]),true);
    // lidé na mostě (hlavy a ramena nad zábradlím), mezi nimi vykukují kočky – jen tam, kde kočka
    // (polovina chodce) není menší než nejmenší velikost
    const ps=[];for(let i=1;i<NA;i++)for(const f of[.3,.72]){const x=BP((i+f)/NA)[0];if(sAt(x)>=BMIN)ps.push(x)}
    const cand=ps.filter(()=>R()<.55),crowd=[];
    for(let x=BA[0]+20;x<BB[0]-30;){const s=sAt(x);
      if(cand.every(c=>Math.abs(c-x)>30*s)&&PX.every(a=>Math.abs(a-x)>16*s)&&R()<.7)crowd.push([x,parY(x),s,R()]);
      x+=rr(22,46)*s}
    add('paper',1.1,q=>{for(const[x,y,s]of crowd){qe(q,x,y-6*s,10.5*s,9*s);qe(q,x,y-22*s,6*s,6.8*s)}});
    add('none',1,q=>{for(const[x,y,s,v]of crowd){if(v<.25)q.line(x-8*s,y-27*s,x+8*s,y-27*s,.1);else if(v<.35){q.line(x+7*s,y-12*s,x+9*s,y-46*s,.1);q.poly(dome(x+9*s,y-44*s,16*s,9*s,6),true,.1)}}});
    for(const x of cand){const y=parY(x),s=sAt(x),r=Math.max(22,BK*s)*.4;if(free(x,y+2,r,O.bridge))spot('parapet',x,y,o=>peek(x,y,S(o,BK)*s,o,.14))}
    // jižní čelo: horní plocha zábradlí, římsa se stínem pod ní, naznačené zdivo z kvádrů
    const Q=P.map(([x,y],j)=>[x,y+FH*bs(j/N)]);
    // bez spodní hrany: ta leží na hladině a prosvítala by pod oblouky jako rovná čára
    add('paper',0,q=>q.poly([...P,...Q.slice().reverse()],true,.3));
    add('none',2.2,q=>q.poly([Q[0],...P,Q[N]],false,.3));
    add('none',1,q=>q.poly(at(3),false,.2));
    add('shade',0,q=>q.poly([...at(15),...at(19).reverse()],true,.1));
    add('none',1.2,q=>{q.poly(at(12),false,.2);q.poly(at(15),false,.2)});
    add('none',.7,q=>{for(let i=0;i<NA;i++){const t0=(i+.1)/NA,t1=(i+.9)/NA;for(let r=0;r<2;r++){const ta=t0+(t1-t0)*R()*.6,tb=Math.min(t1,ta+(t1-t0)*rr(.2,.4)),[xa,ya]=BP(ta),[xb,yb]=BP(tb),sa=bs(ta),sb=bs(tb),dy=[6,26][r];
        ql(q,xa,ya+dy*sa,xb,yb+dy*sb);for(let u=.15;u<1;u+=.3){const x=xa+(xb-xa)*u,y=ya+(yb-ya)*u+dy*(sa+(sb-sa)*u);ql(q,x,y,x,y+5*sa)}}}});
    // oblouky: ploché segmentové, patky nízko nad vodou. Průhled pod mostem je severní oblouk posunutý do dálky
    // (doprava a výš); mezi ním a jižním obloukem je vidět vnitřní stěna vzdálenějšího pilíře a kus klenby vlevo.
    const SP=16,RI=27,fr=.5,Rc=(1+fr*fr)/(2*fr),seg=v=>{const u=2*v-1;return(Math.sqrt(Rc*Rc-u*u)-(Rc-fr))/fr};
    const arcs=[],inner=[],jamb=[];
    for(let i=0;i<NA;i++){const ta=(i+PW*(i?1:.5))/NA,tb=(i+1-PW*(i+1<NA?1:.5))/NA,top=[],bot=[];
      for(let k=0;k<=14;k++){const x=BP(ta+(tb-ta)*k/14)[0],s=sAt(x),yw=watY(x);top.push([x,yw-(SP+RI*seg(k/14))*s]);bot.push([x,yw])}
      const xa=top[0][0],xb=top[14][0],sm=sAt((xa+xb)/2),dX=(xb-xa)*.16,dY=5*sm;
      const nt=x=>{if(x<=xa)return top[0][1];for(let k=1;k<=14;k++)if(top[k][0]>=x){const p=top[k-1],r=top[k];return p[1]+(r[1]-p[1])*(x-p[0])/((r[0]-p[0])||1)}return top[14][1]};
      const fin=[],ed=[[xa+dX,watY(xa+dX)]];let far=true;
      for(let k=0;k<=12;k++){const x=xa+dX+(xb-xa-dX)*k/12,yn=nt(x),yf=nt(x-dX)-dY;fin.push([x,Math.max(yn,yf)]);if(far&&yf>yn+.5)ed.push([x,yf]);else far=false}
      arcs.push(top);inner.push(fin);jamb.push(ed);
      // výplň bez obrysu, obrys jen po klenbě a ostěních – na hladině pod oblouky nemá být rovná čára
      add('shade',0,q=>q.poly([...top,...bot.slice().reverse()],true,.2));
      add('none',1.6,q=>q.poly([bot[0],...top,bot[14]],false,.2))}
    add('paper',0,q=>{for(const fin of inner){const a=fin[0][0],b=fin[fin.length-1][0];qp(q,[...fin,[b,watY(b)],[a,watY(a)]])}});
    add('none',.9,q=>{for(const ed of jamb)if(ed.length>1)q.poly(ed,false,.05)});
    // jedna vlnka v průhledu
    add('none',.8,q=>{for(const fin of inner){const a=fin[0][0],b=fin[fin.length-1][0],m=(a+b)/2,s=sAt(m),yw=watY(m),w=Math.min(10*s,(b-a)*.25);q.curve([[m-w,yw-4*s],[m-w/2,yw-5.5*s],[m,yw-4*s],[m+w/2,yw-2.5*s],[m+w,yw-4*s]],false)}});
    // klenáky: krátké paprsky kolem oblouku
    add('none',.8,q=>{for(const top of arcs)for(let k=2;k<13;k+=2){const[x,y]=top[k],s=sAt(x);ql(q,x,y,x+(k-7)*.3*s,y-5*s)}});
    // pilíře: mohutný opěrák vystupuje z čela od ledolamu až pod římsu (na něm stojí socha), levý bok ve stínu
    const pr=[];for(let i=1;i<NA;i++){const xl=BP((i-PW)/NA)[0],xr=BP((i+PW)/NA)[0],xc=BP(i/NA)[0],s=sAt(xc);pr.push({xl,xr,xc,s,w:xr-xl,yc:watY(xc)})}
    add('paper',0,q=>{for(const{xl,xr,s,w}of pr){const a=xl+w*.14,b=xr-w*.06;qp(q,[[a,parY(a)+15*s],[b,parY(b)+15*s],[b,watY(b)-8*s],[a,watY(a)-8*s]])}});
    add('none',1.3,q=>{for(const{xl,xr,s,w}of pr){const a=xl+w*.14,b=xr-w*.06;ql(q,a,parY(a)+15*s,a,watY(a)-8*s);ql(q,b,parY(b)+15*s,b,watY(b)-8*s)}});
    add('shade',1,q=>{for(const{xl,w,s}of pr){const a=xl+w*.14,c=a-w*.1;qp(q,[[c,parY(c)+16*s],[a,parY(a)+15*s],[a,watY(a)-8*s],[c,watY(c)-8*s]])}});
    add('none',.7,q=>{for(const{xl,xr,s,w}of pr){const a=xl+w*.14,b=xr-w*.06;for(const f of[.35,.65]){const ya=parY(a)+19*s+(watY(a)-parY(a)-27*s)*f,yb=parY(b)+19*s+(watY(b)-parY(b)-27*s)*f;ql(q,a,ya,b,yb)}}});
    // kamenné ledolamy: trojboká špice přes celou šířku pilíře k divákovi (proti proudu), stěny do výšky patek
    // oblouků, nízká stříška stoupá od špice k pilíři; spodek ve vodě s vlnkami. Kočka sedí na stříšce.
    const cw=pr.map(({xl,xr,xc,s,w,yc})=>{const h=SP*s*.95,hT=9*s,L0=[xl,watY(xl)],R0=[xr,watY(xr)],T0=[xc-w*.12,yc+15*s];
      return{L0,R0,T0,h,hT,A:[xc-w*.03,yc-h-6*s],s,xc,yc}});
    const up=([x,y],h)=>[x,y-h];
    add('shade',1.4,q=>{for(const{L0,T0,h,hT}of cw)qp(q,[L0,T0,up(T0,hT),up(L0,h)])});
    add('paper',1.4,q=>{for(const{R0,T0,h,hT}of cw)qp(q,[T0,R0,up(R0,h),up(T0,hT)])});
    add('none',.7,q=>{for(const{R0,T0,h,hT}of cw)for(const f of[.4,.75])ql(q,T0[0],T0[1]-hT*f,R0[0],R0[1]-h*f)});
    add('paper',1.3,q=>{for(const{L0,R0,T0,h,hT,A}of cw){qp(q,[up(L0,h),up(T0,hT),A]);qp(q,[up(T0,hT),up(R0,h),A])}});
    add('shade',0,q=>{for(const{L0,T0,h,hT,A}of cw)qp(q,[up(L0,h),up(T0,hT),A])});
    // vlnky kolem paty pilíře a špice
    add('none',.9,q=>{for(const{L0,R0,T0,s}of cw){if(T0[1]+6*s>PT-6)continue;for(const sd of[-1,1])q.curve([[T0[0]+sd*3*s,T0[1]+2*s],[T0[0]+sd*11*s,T0[1]+1*s],[T0[0]+sd*19*s,T0[1]-2*s]],false);
      q.curve([[T0[0]-7*s,T0[1]+7*s],[T0[0]-2*s,T0[1]+5.5*s],[T0[0]+3*s,T0[1]+7*s],[T0[0]+8*s,T0[1]+6*s]],false);
      q.curve([[L0[0]-9*s,L0[1]+2*s],[L0[0]-5*s,L0[1]+.5*s],[L0[0]-1*s,L0[1]+2*s]],false);q.curve([[R0[0]+1*s,R0[1]+2*s],[R0[0]+5*s,R0[1]+.5*s],[R0[0]+9*s,R0[1]+2*s]],false)}});
    for(const{A,T0,hT,s}of cw){if(s<.85)continue;   // jen bližší ledolamy, na vzdálených je kočka moc velká
     const cx=A[0]+(T0[0]-A[0])*.3,cy=A[1]+(T0[1]-hT-A[1])*.3+2*s,s0=Math.max(22,BK*s);
      if(free(cx,cy-s0*.73,s0*.38,O.bridge))spot('pier',cx,cy,o=>sitCat(cx,cy,Math.max(22,S(o,BK)*s),o))}
    // sochy na jižní straně s podstavci (patka, kartuš, římsa), kočka sedí u podstavce
    for(let i=1;i<NA;i++){const t=i/NA,s=bs(t),x=px(i),y=parY(x),d=R()<.5?-1:1,s0=Math.max(22,BK*s),hw=(sv[i]===2||sv[i]===5?34:22)*s*SK,cx=x+d*(hw+s0*.42);
      if(s>=BMIN&&free(cx,y-s0*.73,s0*.38,O.bridge))spot('statue',cx,y,o=>{const s2=Math.max(22,S(o,BK)*s);sitCat(x+d*(hw+s2*.42),y+1,s2,o)});
      SS.push([x,y-37*s*SK,s*1.3*SK,sv[i]])}
    add('paper',1.4,q=>{for(const[x,b,s0]of SS){const s=s0/1.3;q.rect(x-13*s,b+3*s,26*s,34*s,.1);qb(q,x-15*s,b,30*s,5*s);qb(q,x-15*s,b+31*s,30*s,6*s)}});
    add('none',.8,q=>{for(const[x,b,s0]of SS){const s=s0/1.3;qe(q,x,b+18*s,6*s,8*s,8)}});
    saints(SS,false);
    // lucerny mezi sochami
    const lp=[];for(let i=0;i<NA;i++){const x=BP((i+.5)/NA)[0];lp.push([x,parY(x),bs((i+.5)/NA)*.85])}
    add('none',1.4,q=>{for(const[x,y,s]of lp)q.line(x,y-5*s,x,y-50*s,.05)});
    add('paper',1.2,q=>{for(const[x,y,s]of lp){qb(q,x-4*s,y-6*s,8*s,6*s);q.poly([[x-4*s,y-50*s],[x+4*s,y-50*s],[x+6*s,y-62*s],[x-6*s,y-62*s]],true,.05);q.poly([[x-8*s,y-62*s],[x,y-70*s],[x+8*s,y-62*s]],true,.05)}});
  }

  /* ---------- lodě ---------- */
  // výletní loď: v 0 prosklená, 1 parník s kolesem a komínem, 2 otevřená s plachtou; w délka, d měřítko
  function boat(x,y,w,d,v,dir){const s=d,X=u=>x+dir*u,hw=w/2,hh=30*s,dy=y-hh,cat=R()<.8,cw=R()<.5;
    add('paper',2,q=>q.poly([[X(-hw),dy],[X(hw+16*s),dy-10*s],[X(hw-24*s),y],[X(-hw+10*s),y]],true,.3));
    add('none',1.1,q=>{q.line(X(-hw+6*s),dy+10*s,X(hw-6*s),dy+7*s,.2);for(let k=-3;k<=3;k++)q.curve([[x+k*w*.14-12*s,y+3],[x+k*w*.14,y],[x+k*w*.14+12*s,y+3]],false)});
    if(v===0){const c0=-hw+20*s,c1=hw-80*s,wt=dy-40*s,wb=dy-8*s;
      add('paper',2,q=>q.poly(rbox(Math.min(X(c0),X(c1)),dy-50*s,Math.max(X(c0),X(c1)),dy,12*s),true,.2));
      add('shade',1.2,q=>q.rect(Math.min(X(c0+10*s),X(c1-10*s)),wt,Math.abs(c1-c0-20*s),wb-wt,.1));
      const ms=[];for(let u=c0+44*s;u<c1-20*s;u+=40*s)ms.push(X(u));
      add('none',1.2,q=>{for(const m of ms)q.line(m,wt,m,wb,.05)});
      if(cat&&ms.length>1){const a=(ms[0]+ms[1])/2+(cw?0:40*s*dir*(ms.length>2?1:0));if(free(a,wb,Math.max(22,BK*d)*.4,O.boat))spot('boat',a,wb,o=>peek(a,wb,S(o,BK)*d,o,.08))}
      add('paper',1,q=>q.rect(Math.min(X(c0),X(c1)),wb,Math.abs(c1-c0),4*s,.05));
      add('none',1,q=>{q.line(X(c0),dy-64*s,X(c1),dy-64*s,.1);for(let u=c0;u<=c1;u+=24*s)q.line(X(u),dy-50*s,X(u),dy-64*s,.05);q.line(X(c0+8*s),dy-50*s,X(c0+8*s),dy-100*s,.1)});
      add('paper',1,q=>q.poly([[X(c0+8*s),dy-100*s],[X(c0+30*s),dy-94*s],[X(c0+8*s),dy-88*s]],true,.05))}
    else if(v===1){const c0=-hw+24*s,c1=hw-70*s,pb=X(-hw*.15);
      add('paper',2,q=>q.rect(Math.min(X(c0),X(c1)),dy-40*s,Math.abs(c1-c0),40*s,.2));
      const aw=[];for(let u=c0+14*s;u<c1-14*s;u+=26*s)if(Math.abs(X(u)-pb)>50*s)aw.push(X(u));
      add('shade',.9,q=>{for(const a of aw)q.poly(farch(a,dy-34*s,7*s,dy-10*s),true,.05)});
      if(cat&&aw.length){const a=aw[cw?0:aw.length-1];if(free(a,dy-10*s,Math.max(22,BK*d)*.4,O.boat))spot('boat',a,dy-10*s,o=>peek(a,dy-10*s,S(o,BK)*d,o,.06))}
      add('paper',1.8,q=>q.poly(dome(pb,dy+6*s,46*s,50*s,10),true,.1));
      add('none',1,q=>{for(let k=1;k<8;k++){const a=PI+k/8*PI;q.line(pb,dy+6*s,pb+Math.cos(a)*44*s,dy+6*s+Math.sin(a)*48*s,.05)}q.ell(pb,dy+2*s,10*s,8*s,.05)});
      add('none',1.1,q=>{q.line(X(c0),dy-54*s,X(c1),dy-54*s,.1);for(let u=c0;u<=c1;u+=18*s)q.line(X(u),dy-40*s,X(u),dy-54*s,.05)});
      const fx=X(-hw*.05);
      add('paper',1.8,q=>q.poly([[fx-9*s,dy-40*s],[fx+9*s,dy-40*s],[fx+11*s-dir*6*s,dy-112*s],[fx-11*s-dir*6*s,dy-112*s]],true,.1));
      add('shade',1,q=>q.poly([[fx-11*s-dir*5*s,dy-104*s],[fx+11*s-dir*5*s,dy-104*s],[fx+11*s-dir*6*s,dy-112*s],[fx-11*s-dir*6*s,dy-112*s]],true,.05));
      add('none',1.2,q=>{q.line(X(c1-10*s),dy-40*s,X(c1-10*s),dy-120*s,.05);q.line(X(c0+10*s),dy-40*s,X(c0+10*s),dy-100*s,.05);q.line(X(c1-10*s),dy-120*s,X(hw+14*s),dy-12*s,.05)});
      add('paper',1,q=>{q.poly([[X(c1-10*s),dy-120*s],[X(c1-10*s)-dir*22*s,dy-114*s],[X(c1-10*s),dy-108*s]],true,.05);q.poly([[X(c0+10*s),dy-100*s],[X(c0+10*s)-dir*22*s,dy-94*s],[X(c0+10*s),dy-88*s]],true,.05)})}
    else{const c0=-hw+16*s,c1=hw-60*s,hd=[];
      add('none',1.6,q=>{for(let u=c0;u<=c1;u+=(c1-c0)/3)q.line(X(u),dy,X(u),dy-58*s,.05)});
      const ca=cw?c0+(c1-c0)*.3:c0+(c1-c0)*.7;
      for(let u=c0+12*s;u<c1-8*s;u+=22*s)if(Math.abs(u-ca)>28*s&&R()<.8)hd.push([X(u),R()]);
      add('paper',1.1,q=>{for(const[a]of hd){qe(q,a,dy-8*s,10*s,9*s);qe(q,a,dy-25*s,6.5*s,7.5*s)}});
      if(cat&&free(X(ca),dy,Math.max(22,BK*d)*.4,O.boat))spot('boat',X(ca),dy,o=>peek(X(ca),dy,S(o,BK)*d,o,.12));
      add('paper',1.6,q=>q.poly([[X(-hw+4*s),dy+2*s],[X(hw+10*s),dy-6*s],[X(hw+6*s),dy+6*s],[X(-hw+4*s),dy+8*s]],true,.1));
      add('paper',1.8,q=>q.rect(Math.min(X(c0),X(c1))-6*s,dy-68*s,Math.abs(c1-c0)+12*s,12*s,.1));
      add('none',1,q=>{const a=Math.min(X(c0),X(c1))-6*s,b=Math.max(X(c0),X(c1))+6*s;for(let k=a;k<b-8*s;k+=16*s)q.curve([[k,dy-56*s],[k+8*s,dy-50*s],[k+16*s,dy-56*s]],false)})}
    // kočka sedí na přídi
    const bx=X(hw-44*s),by=dy-5*s,s0=Math.max(22,BK*d);
    if(!cat&&free(bx,by-s0*.73,s0*.38,O.boat))spot('deck',bx,by,o=>sitCat(bx,by,S(o,BK)*d,o));
  }
  // šlapadlo: v 0 labuť, 1 se skluzavkou, 2 autíčko
  function pedalo(x,y,w,d,v,dir){const s=d,hw=w/2,sx=x-dir*hw*.25,cat=R()<.75,pp=R()<.5;
    add('paper',1.4,q=>q.rect(x-hw*.7,y-40*s,hw*.9,8*s,.1));
    if(v===1)add('none',2*s+.6,q=>{q.curve([[x-dir*hw*.8,y-12*s],[x-dir*hw*.5,y-30*s],[x-dir*hw*.3,y-52*s]],false);q.line(x-dir*hw*.3,y-52*s,x-dir*hw*.3,y-12*s,.05)});
    if(pp){const a=x+dir*hw*.2;add('paper',1.3,q=>{q.ell(a,y-30*s,12*s,14*s,.05);q.ell(a,y-54*s,8*s,8.5*s,.05)})}
    if(cat&&free(sx,y-14*s-Math.max(22,BK*d)*.73,Math.max(22,BK*d)*.4,O.boat))spot('pedalo',sx,y,o=>sitCat(sx,y-14*s,S(o,BK)*d,o));
    add('paper',1.8,q=>q.poly([[x-hw,y-20*s],[x+hw,y-20*s],[x+hw-6*s,y],[x-hw+6*s,y]],true,.2));
    add('none',.9,q=>{q.line(x-hw+4*s,y-12*s,x+hw-4*s,y-12*s,.1);for(let k=-2;k<=2;k++)q.curve([[x+k*hw*.4-8*s,y+3],[x+k*hw*.4,y],[x+k*hw*.4+8*s,y+3]],false)});
    if(v===0){const nx=x+dir*hw*.78;
      add('paper',1.6,q=>q.curve([[nx-dir*8*s,y-18*s],[nx+dir*2*s,y-44*s],[nx-dir*6*s,y-64*s],[nx+dir*6*s,y-72*s],[nx+dir*16*s,y-66*s],[nx+dir*6*s,y-62*s],[nx+dir*12*s,y-44*s],[nx+dir*8*s,y-18*s]],true));
      add('ink',0,q=>q.poly([[nx+dir*14*s,y-68*s],[nx+dir*22*s,y-64*s],[nx+dir*14*s,y-62*s]],true,.05));
      add('none',1,q=>q.curve([[x-dir*hw*.6,y-16*s],[x-dir*hw*.1,y-26*s],[x+dir*hw*.4,y-16*s]],false))}
    else if(v===2)add('none',1.3,q=>{q.line(x+dir*hw*.4,y-20*s,x+dir*hw*.5,y-40*s,.05);q.line(x+dir*hw*.5,y-40*s,x+dir*hw*.2,y-40*s,.05);q.ell(x+dir*hw*.86,y-14*s,5*s,5*s,.05);q.ell(x-dir*hw*.86,y-14*s,5*s,5*s,.05)});
  }
  function rowboat(x,y,w,d,dir){const s=d,hw=w/2;
    add('none',1.6,q=>{q.line(x-24*s,y-16*s,x-56*s,y+4*s,.05);q.line(x+24*s,y-16*s,x+56*s,y+4*s,.05)});
    const cx=x-dir*hw*.4;
    if(free(cx,y-12*s,Math.max(22,BK*d)*.4,O.boat))spot('rowboat',cx,y,o=>peek(cx,y-14*s,S(o,BK)*d,o,.14));
    add('paper',1.8,q=>q.curve([[x-hw,y-18*s],[x,y-14*s],[x+hw,y-20*s],[x+hw*.7,y],[x-hw*.7,y]],true));
    add('none',.9,q=>{q.line(x-hw*.8,y-11*s,x+hw*.8,y-12*s,.1);q.curve([[x-hw*.6,y+3],[x,y+1],[x+hw*.6,y+3]],false)});
  }

  /* ---------- Staroměstská mostecká věž (vpravo v popředí) ---------- */
  function oldTower(){const x0=2744,x1=3026,T=752,B=1500,cx=(x0+x1)/2,ga=[x0+30,x0+64,x0+98],ch=R()<.5?0:2,xs=x0-42,dz=y=>(y-HY)*.028,GB=Math.round(BB[1]+14);   // boční stěna ubíhá do úběžníku na horizontu HY
    // západní boční stěna (ve stínu) s branou, kudy vchází most, a boční plocha střechy
    add('shade',2,q=>qp(q,[[x0,T+64],[xs,T+64-dz(T+64)],[xs,B-dz(B)],[x0,B]]));
    add('paper',1.6,q=>qp(q,[[x0-8,T],[xs-6,T-dz(T)],[xs-6,T+64-dz(T+64)],[x0-8,T+64]]));
    add('none',1,q=>{for(let k=0;k<3;k++){const a=x0-12-k*13,y=T+8-k*5;q.curve([[a,y+34],[a,y+8],[a-6,y+2],[a-11,y+6],[a-11,y+32]],false)}});
    add('paper',1.8,q=>qp(q,[[x0-2,GB],[x0-2,GB-104],[x0-14,GB-134],[xs+8,GB-134-dz(GB-134)*.8],[xs+4,GB-104-dz(GB-104)],[xs+4,GB-dz(GB)]]));
    add('none',1.4,q=>{ql(q,x0-2,GB,xs+4,GB-dz(GB));for(const y of[930,1170])ql(q,x0,y,xs,y-dz(y))});
    add('shade',2,q=>qp(q,[[x0+10,T],[xs-4,T-dz(T)],[cx-26,T-176]]));
    add('shade',2.4,q=>q.poly([[x0+10,T],[cx-26,T-176],[cx+26,T-176],[x1-10,T]],true,.4));
    add('none',1.4,q=>{q.line(cx,T-176,cx,T-214,.1);q.ell(cx,T-198,4,4,.1);q.line(cx-8,T-207,cx+8,T-207,.1);for(let k=1;k<6;k++){const y=T-k*28;q.line(x0+16+k*16,y,x0+26+k*16,y,.05)}});
    add('paper',1.4,q=>{for(const a of[cx-56,cx+40])q.poly([[a,T-34],[a,T-54],[a+8,T-66],[a+16,T-54],[a+16,T-34]],true,.1)});
    add('paper',2.2,q=>q.rect(x0-8,T,x1-x0+16,64,.3));
    add('shade',1,q=>{for(let x=x0+14;x<x1-10;x+=34)q.poly(farch(x+10,T+8,11,T+42),true,0)});
    for(let i=0;i<3;i++){const a=ga[i]+10;if((i===ch||i===1)&&free(a,T+42,hr(40,1320),O.oldt))spot('oldtower',a,T+42,o=>peek(a,T+42,ks(o,40,1320),o,.08))}
    add('paper',1.8,q=>q.rect(x0-8,T+38,x1-x0+16,18,.2));
    add('none',.9,q=>{for(let x=x0;x<x1;x+=16)q.curve(farch(x+8,T+40,5,T+54),false)});
    for(const tx of[xs,x0-2,x1+2])add('paper',1.8,q=>{const d=tx===xs?dz(T):0;q.rect(tx-(d?10:16),T-24-d,d?20:32,94,.2);q.poly([[tx-(d?12:18),T-24-d],[tx,T-(d?100:116)-d],[tx+(d?12:18),T-24-d]],true,.1)});
    add('paper',2.4,q=>q.rect(x0,T+64,x1-x0,B-T-64,.5));
    add('none',.7,q=>{for(let y=T+84,r=0;y<B-100;y+=22,r++){ql(q,x0,y,x1,y);for(let x=x0+(r%2?22:46);x<x1;x+=48)ql(q,x,y,x,y+22)}});
    add('none',1.6,q=>{for(const y of[T+64,1000,1170,1400])q.line(x0-6,y,x1+6,y,.2)});
    add('shade',1.2,q=>{q.poly(farch(cx-44,806,16,914),true,.2);q.poly(farch(cx+44,806,16,914),true,.2)});
    add('none',1,q=>{for(const a of[cx-44,cx+44]){q.line(a,826,a,914,.1);q.ell(a,822,6,6,.05)}});
    const wx=cx+(R()<.5?-44:44);if(free(wx,914,hr(40,1320),O.oldt))spot('oldtower',wx,914,o=>peek(wx,914,ks(o,40,1320),o,.08));
    add('paper',1,q=>{q.rect(cx-64,913,40,4,.05);q.rect(cx+24,913,40,4,.05)});
    add('paper',1.4,q=>{for(let k=0;k<5;k++){const sx=x0+36+k*50;q.poly([[sx-14,1020],[sx+14,1020],[sx+14,1040],[sx,1058],[sx-14,1040]],true,.1)}});
    add('none',.9,q=>{for(let k=0;k<5;k++){const sx=x0+36+k*50;if(k%2)q.line(sx-14,1030,sx+14,1030,.05);else q.line(sx,1022,sx,1054,.05)}});
    // lomené niky se sedícími králi, prostřední je prázdná
    const ni=[cx-74,cx,cx+74];
    add('shade',1.2,q=>{for(const a of ni)q.poly(farch(a,1196,24,1330),true,.1)});
    add('paper',1.4,q=>{for(const a of[ni[0],ni[2]]){q.poly([[a-15,1330],[a+15,1330],[a+12,1266],[a-12,1266]],true,.1);q.ell(a,1254,9,11,.05);q.poly([[a-8,1245],[a-8,1236],[a-4,1241],[a,1233],[a+4,1241],[a+8,1236],[a+8,1245]],true,.05)}});
    if(free(cx,1330-Math.max(22,44*D(1320))*.73,hr(44,1320),O.oldt))spot('oldtower',cx,1330,o=>sitCat(cx,1330,ks(o,44,1320),o));
    add('paper',1.6,q=>q.rect(x0-10,1330,x1-x0+20,14,.2));
    add('paper',2,q=>q.rect(x0-12,1400,x1-x0+24,100,.4));
  }

  /* ---------- nábřeží a promenáda ---------- */
  function lampPost(x,b,cat){
    add('paper',1.8,q=>q.poly([[x-14,b],[x+14,b],[x+8,b-40],[x-8,b-40]],true,.2));
    add('paper',1.5,q=>q.poly([[x-5,b-40],[x+5,b-40],[x+3,b-214],[x-3,b-214]],true,.1));
    add('none',1,q=>{q.ell(x,b-120,7,4,.05);q.line(x-14,b-200,x+14,b-200,.1);q.curve([[x-14,b-200],[x-18,b-192],[x-12,b-188]],false);q.curve([[x+14,b-200],[x+18,b-192],[x+12,b-188]],false)});
    add('shade',1.6,q=>q.poly([[x-9,b-214],[x+9,b-214],[x+15,b-250],[x-15,b-250]],true,.1));
    add('none',1,q=>q.line(x,b-214,x,b-250,.05));
    add('paper',1.8,q=>q.poly([[x-20,b-250],[x+20,b-250],[x+13,b-264],[x-13,b-264]],true,.1));
    // kočka leží na stříšce lucerny za ozdobnou korunkou, hlavou ven
    const d=Math.round(x/10)%2?1:-1,cx=x+d*9;
    if(cat&&free(cx+d*16,b-264-Math.max(22,34*D(1500))*.3,hr(34,1500)*.85,O.quay))spot('lamp',cx,b-264,o=>loafCat(cx,b-263,ks(o,34,1500),Object.assign({},o,{dir:d})));
    add('paper',1.4,q=>q.poly([[x-15,b-262],[x+15,b-262],[x+15,b-272],[x+11,b-281],[x+7,b-273],[x,b-285],[x-7,b-273],[x-11,b-281],[x-15,b-272]],true,.1));
    add('none',1.3,q=>{q.line(x-15,b-267,x+15,b-267,.05);q.line(x,b-285,x,b-294,.05);q.ell(x,b-297,3,3,.1)});
  }
  function quay(pil){
    add('paper',2.2,q=>q.rect(-10,PT,W+20,60,.6));
    add('none',.9,q=>{ql(q,-10,PT+12,W+10,PT+12);for(let y=PT+14,r=0;y<PT+56;y+=14,r++)for(let x=(r%2)*36;x<W;x+=72)ql(q,x,y,x,y+14)});
    // kamenná balustráda: kuželky mezi pilíři a madlo
    add('paper',1.1,q=>{for(let x=10;x<W;x+=17)if(pil.every(p=>Math.abs(p.x-x)>32))qp(q,[[x-3,PT],[x+3,PT],[x+6,PT-7],[x+2,PT-15],[x+4,PT-24],[x-4,PT-24],[x-2,PT-15],[x-6,PT-7]])});
    add('paper',1.8,q=>qb(q,-10,PT-34,W+20,10));
    add('none',.7,q=>ql(q,-10,PT-29,W+10,PT-29));
    for(const p of pil){const x=p.x;
      add('paper',2,q=>q.rect(x-26,PT-40,52,100,.2));
      add('none',.8,q=>q.rect(x-18,PT-30,36,64,.1));
      add('paper',1.8,q=>q.rect(x-31,PT-48,62,10,.2));
      if(p.lamp)lampPost(x,PT-48,p.cat);
      else if(p.ball)add('paper',1.6,q=>{q.ell(x,PT-62,13,13,.03);q.rect(x-9,PT-52,18,5,.05)});
      else{// kamenná váza s květinami; kočka sedí na pilíři za ní a kouká ven
        const s0=Math.max(22,44*D(1500)),d=Math.round(x/10)%2?1:-1,cx=x+d*15;
        if(p.cat&&free(cx+d*4,PT-48-s0*.73,s0*.38,O.quay))spot('railing',cx,PT-48,o=>sitCat(o.kitten?x+d*25:cx,PT-47,ks(o,44,1500),Object.assign({},o,{dir:d})));
        add('none',1.2,q=>{for(const k of[-1,0,1])q.curve([[x-d*4+k*5,PT-84],[x-d*(8+k*4),PT-98],[x-d*(12+k*7),PT-106+Math.abs(k)*5]],false)});
        add('paper',1.2,q=>{for(const k of[-1,0,1])qe(q,x-d*(12+k*7),PT-106+Math.abs(k)*5,4.5,4,6)});
        add('paper',1.6,q=>{qp(q,[[x-6,PT-48],[x+6,PT-48],[x+5,PT-56],[x+17,PT-66],[x+15,PT-80],[x+19,PT-84],[x+19,PT-89],[x-19,PT-89],[x-19,PT-84],[x-15,PT-80],[x-17,PT-66],[x-5,PT-56]])});
        add('none',.9,q=>{ql(q,x-16,PT-80,x+16,PT-80);q.curve([[x-12,PT-70],[x,PT-66],[x+12,PT-70]],false)})}}
  }
  // dlažba promenády v perspektivě (úběžník nad řekou) se vzorem mozaiky; chodník dole pokračuje stejnými spárami
  function pavement(){const y0=1506,y1=1698,vx=1500,vy=HY,n=7,rows=[],cols=[],xa=(xb,y)=>vx+(xb-vx)*(y-vy)/(y1-vy);
    for(let k=0;k<=n;k++)rows.push(y0+(y1-y0)*Math.pow(k/n,1.2));
    for(let xb=-2400;xb<=5400;xb+=120)cols.push(xb);
    add('shade',0,q=>{for(let r=0;r<n;r++)for(let c=0;c<cols.length-1;c++){if((r+c)%4&&(r-c+400)%4)continue;const a=rows[r]+3,b=rows[r+1]-3,p0=xa(cols[c],a)+4,p1=xa(cols[c+1],a)-4,p2=xa(cols[c+1],b)-4,p3=xa(cols[c],b)+4;
      if(Math.max(p1,p2)<-20||Math.min(p0,p3)>W+20)continue;qp(q,[[p0,a],[p1,a],[p2,b],[p3,b]])}});
    add('none',.7,q=>{for(const y of rows)ql(q,-10,y,W+10,y);for(const xb of cols){const a=xa(xb,y0);if(Math.max(a,xb)<-10||Math.min(a,xb)>W+10)continue;ql(q,a,y0,xb,y1)}
      for(const xb of cols){const a=xa(xb,1912),b=xa(xb,2000);if(Math.max(a,b)<-10||Math.min(a,b)>W+10)continue;ql(q,a,1912,b,2000)}});
  }
  function street(){
    add('paper',2,q=>q.rect(-10,1698,W+20,12,.3));
    add('none',.7,q=>{for(let y=1728,r=0;y<1896;y+=19,r++)for(let x=(r%2)*24-24;x<W;x+=48)q.curve([[x,y],[x+21,y-9],[x+42,y]],false)});
    add('paper',0,q=>{qb(q,-10,1764,W+20,24);qb(q,-10,1836,W+20,24)});
    add('none',2,q=>{for(const y of[1768,1782,1840,1854])ql(q,-10,y,W+10,y)});
    add('none',.8,q=>{for(const y of[1774,1846])for(let x=0;x<W;x+=60)ql(q,x,y-4,x+30,y-4)});
    add('paper',2,q=>q.rect(-10,1900,W+20,12,.3));
    add('none',.8,q=>ql(q,-10,1954,W+10,1954));
  }
  function linden(x,y,cr){const cy=y-180-cr*.6;
    add('none',1.3,q=>{q.ell(x,y-2,40,8,.05);q.ell(x,y-2,28,5,.05)});
    add('paper',2.2,q=>q.poly([[x-17,y],[x-10,cy+cr*.3],[x+10,cy+cr*.3],[x+17,y]],true,.4));
    add('none',1,q=>{for(let i=0;i<5;i++){const yy=y-rr(20,150);q.line(x+rr(-6,6),yy,x+rr(-6,6),yy-rr(12,26),.3)}}); // kůra
    add('none',2,q=>{q.line(x,cy+cr*.5,x-cr*.55,cy,.3);q.line(x,cy+cr*.4,x+cr*.5,cy-cr*.1,.3)});
    const bl=[];for(let i=0;i<9;i++){const a=i/9*PI*2+rr(-.3,.3),dd=cr*rr(.45,.7);bl.push([x+Math.cos(a)*dd*1.15,cy+Math.sin(a)*dd*.85,cr*rr(.42,.55)])}
    bl.push([x,cy,cr*.62]);bl.sort((a,b)=>a[1]-b[1]);
    // spodní kuličky koruny mají vlastní stín (srpek šraf podél spodního okraje)
    for(const[a,b,r]of bl){add('paper',2,q=>qe(q,a,b,r*1.1,r*.95,12));
      if(b>cy-cr*.05)add('shade',0,q=>{const p=[];for(let k=0;k<=8;k++){const t=(.12+k/8*.76)*PI;p.push([a+Math.cos(t)*r*1.06,b+Math.sin(t)*r*.9])}
        for(let k=8;k>=0;k--){const t=(.12+k/8*.76)*PI;p.push([a+Math.cos(t)*r*.9,b+r*.28+Math.sin(t)*r*.42])}q.curve(p,true)})}
    add('none',1,q=>{for(let i=0;i<46;i++){const a=R()*PI*2,d=Math.sqrt(R())*cr*.95,px=x+Math.cos(a)*d*1.15,py=cy+Math.sin(a)*d*.8;q.curve([[px-7,py],[px,py-5],[px+7,py]],false)}});
    const tx=x+rr(-.4,.4)*cr,ty=cy+rr(-.35,.2)*cr;
    spot('linden',tx,ty,o=>{const r=Math.max(22,ks(o,50,y))*.4;head(tx,ty,r,o);reg(o,tx,ty-r*.3,r*1.3)});
  }
  function benchP(x,y){const w=rr(170,210),v=R(),ux=x+rr(-.25,.25)*w,sx=x+rr(-.2,.2)*w,pp=R()<.35;
    add('paper',1.6,q=>{q.rect(x-w/2,y-106,w,12,.3);q.rect(x-w/2,y-86,w,12,.3)});
    if(v<.5)add('none',2.6,q=>{for(const d of[-1,1]){const a=x+d*(w/2-16);q.curve([[a,y-110],[a-d*4,y-80],[a,y-56],[a+d*10,y-30],[a+d*4,y]],false);q.curve([[a,y-56],[a-d*14,y-30],[a-d*8,y]],false)}});
    else add('none',2.6,q=>{for(const d of[-1,1]){const a=x+d*(w/2-16);q.line(a,y-110,a,y-50,.2);q.line(a-d*4,y-50,a-d*8,y,.2);q.line(a+d*6,y-50,a+d*10,y,.2)}});
    if(free(ux,y-2-Math.max(22,38*D(y))*.3,hr(38,y)*.85,P9(y)))spot('underbench',ux,y,o=>loafCat(ux,y-2,ks(o,38,y),o));
    add('paper',2.2,q=>q.rect(x-w/2-6,y-58,w+12,13,.4));
    add('none',.8,q=>q.line(x-w/2,y-51,x+w/2,y-51,.3));
    if(pp){const px=x-(sx>x?1:-1)*w*.3;add('paper',1.3,q=>{q.poly([[px-20,y-58],[px+20,y-58],[px+14,y-76],[px-14,y-76]],true,.1);q.line(px-12,y-70,px+12,y-70,.1)})}
    spot('bench',sx,y-58,o=>sleepCat(sx,y-57,ks(o,50,y),o));
  }
  function chair(x,y,d){
    add('none',1.8,q=>{q.curve([[x-d*16,y-50],[x-d*20,y-80],[x-d*14,y-104],[x+d*2,y-106],[x+d*6,y-90]],false);q.line(x-d*16,y-50,x-d*14,y,.1);q.line(x+d*16,y-50,x+d*18,y,.1);q.line(x-d*6,y-50,x-d*2,y-4,.1)});
    add('paper',1.8,q=>q.ell(x,y-52,24,7,.05));
  }
  function cafe(x,y){const v=Math.floor(R()*3),d=R()<.5?-1:1,cx=x+d*74,pp=R()<.5,cup=R()<.6;
    if(v<2){add('none',2,q=>q.line(x,y-4,x,y-210,.1));
      if(v===0){add('paper',2,q=>q.poly([[x-120,y-176],[x+120,y-176],[x+62,y-214],[x-62,y-214]],true,.2));
        add('none',1,q=>{for(let k=x-120;k<x+118;k+=20)q.curve([[k,y-176],[k+10,y-168],[k+20,y-176]],false);q.line(x-40,y-214,x-70,y-176,.1);q.line(x+40,y-214,x+70,y-176,.1)})}
      else{add('shade',1.8,q=>q.poly(dome(x,y-172,116,44,12),true,.1));add('none',1,q=>{for(const a of[-.6,-.2,.2,.6])q.line(x,y-216,x+a*116,y-172,.1)})}}
    chair(cx,y,d);
    if(pp){const a=x-d*74;chair(a,y,-d);add('paper',1.5,q=>{q.poly([[a-18,y-54],[a+18,y-54],[a+14,y-104],[a-14,y-104]],true,.2);q.ell(a,y-118,12,14,.05)});
      add('none',2.4,q=>{q.line(a-8,y-54,a+d*20,y-50,.1);q.line(a+d*20,y-50,a+d*24,y,.1)})}
    else chair(x-d*74,y,-d);
    const s0=Math.max(22,42*D(y));
    if(free(cx,y-52-s0*.73,s0*.38,P9(y)))spot('cafe',cx,y-52,o=>sitCat(cx,y-51,ks(o,42,y),o));
    add('none',2.2,q=>{q.line(x,y-74,x,y-6,.1);q.line(x-20,y-2,x+20,y-2,.1)});
    add('paper',2,q=>q.ell(x,y-78,46,10,.05));
    if(cup)add('paper',1.2,q=>{q.rect(x-14,y-94,12,14,.05);q.ell(x-8,y-82,10,3,.05);q.poly([[x+8,y-82],[x+22,y-82],[x+20,y-106],[x+10,y-106]],true,.05)});
  }
  // kiosek: v 0 zmrzlina, 1 trdelník, 2 suvenýry
  function kiosk(x,y){const w=170,h=150,top=y-h,v=Math.floor(R()*3),rx=x+(R()<.5?-1:1)*w*.25,wx=x+rr(-.2,.2)*w;
    add('paper',2.2,q=>q.rect(x-w/2,top,w,h,.4));
    add('none',.8,q=>{for(let a=x-w/2+12;a<x+w/2;a+=14)q.line(a,top+104,a,y-4,.1)});
    add('shade',1.4,q=>q.rect(x-w/2+20,top+36,w-40,58,.3));
    if(v===1)add('paper',1.2,q=>{for(let k=0;k<3;k++)q.ell(x-40+k*40,top+62,14,8,.05)});
    if(free(wx,top+94,hr(40,y),P9(y)))spot('kiosk',wx,top+94,o=>peek(wx,top+94,ks(o,40,y),o,.08));
    add('paper',1.8,q=>q.rect(x-w/2+12,top+92,w-24,10,.2));
    add('paper',2,q=>q.poly([[x-w/2-14,top+30],[x+w/2+14,top+30],[x+w/2,top],[x-w/2,top]],true,.2));
    add('shade',0,q=>{for(let k=0;k<9;k+=2){const a=x-w/2-14+k*(w+28)/9,b=x-w/2+k*w/9;q.poly([[a,top+30],[a+(w+28)/9,top+30],[b+w/9,top],[b,top]],true,.05)}});
    add('none',1.1,q=>{for(let k=x-w/2-14;k<x+w/2+12;k+=22)q.curve([[k,top+30],[k+11,top+39],[k+22,top+30]],false)});
    add('paper',2,q=>q.rect(x-w/2-6,top-12,w+12,12,.3));
    const sx=-(rx-x)+x;
    if(v===0){add('paper',1.8,q=>{q.poly([[sx-16,top-40],[sx+16,top-40],[sx,top-4]],true,.1);q.ell(sx,top-50,17,14,.05);q.ell(sx,top-70,13,12,.05)});
      add('none',.8,q=>{q.line(sx-10,top-34,sx+6,top-16,.05);q.line(sx+10,top-34,sx-6,top-16,.05)})}
    else if(v===1){add('paper',1.8,q=>q.rect(sx-40,top-46,80,32,.2));add('none',1.2,q=>{q.curve([[sx-30,top-30],[sx-20,top-40],[sx-10,top-22],[sx,top-40],[sx+10,top-22],[sx+20,top-40],[sx+30,top-30]],false);q.line(sx-20,top-14,sx-20,top-12,.05);q.line(sx+20,top-14,sx+20,top-12,.05)})}
    else add('paper',1.4,q=>{for(let k=0;k<3;k++)q.rect(sx-34+k*24,top-38,20,26,.1)});
    const s0=Math.max(22,38*D(y));
    if(free(rx,top-12-s0*.3,s0*.33,P9(y)))spot('kioskroof',rx,top-12,o=>loafCat(rx,top-11,ks(o,38,y),o));
  }
  // pouliční muzikant (kytara, harmonika nebo kontrabas) s otevřeným pouzdrem
  function busker(x,y){const v=Math.floor(R()*3),d=R()<.5?-1:1,cx=x+d*74;
    add('none',3,q=>{q.line(x-8,y-80,x-12,y,.2);q.line(x+8,y-80,x+14,y,.2)});
    add('paper',2,q=>q.poly([[x-20,y-78],[x+20,y-78],[x+16,y-150],[x-16,y-150]],true,.3));
    add('paper',1.8,q=>q.ell(x,y-166,13,15,.05));
    add('none',1.4,q=>{q.curve([[x-13,y-170],[x-6,y-186],[x+10,y-184],[x+14,y-168]],false);q.line(x-18,y-180,x+18,y-180,.1)});
    if(v===0){add('paper',1.8,q=>{q.ell(x-d*6,y-96,20,17,.05);q.ell(x+d*12,y-112,15,13,.05)});add('none',2.2,q=>q.line(x+d*18,y-118,x+d*62,y-150,.1));add('ink',0,q=>q.ell(x+d*6,y-106,4,4,.05))}
    else if(v===1){add('paper',1.8,q=>{q.rect(x-30,y-136,18,44,.1);q.rect(x+12,y-136,18,44,.1)});add('none',1,q=>{for(let k=0;k<5;k++)q.line(x-12,y-134+k*9,x+12,y-130+k*9,.05)})}
    else{add('paper',1.8,q=>q.curve([[x+d*20,y-4],[x+d*6,y-40],[x+d*14,y-80],[x+d*32,y-94],[x+d*44,y-60],[x+d*40,y-4]],true));add('none',2,q=>q.line(x+d*30,y-90,x+d*30,y-200,.1))}
    add('paper',1.6,q=>q.poly([[cx-40,y-10],[cx+40,y-10],[cx+34,y-40],[cx-34,y-40]],true,.1));
    add('shade',1.4,q=>q.poly([[cx-38,y-2],[cx+38,y-2],[cx+34,y-12],[cx-34,y-12]],true,.1));
    const s0=Math.max(22,40*D(y));
    if(free(cx,y-4-s0*.3,s0*.33,P9(y)))spot('busker',cx,y-4,o=>loafCat(cx,y-3,ks(o,40,y),o));
    add('paper',1.6,q=>q.poly([[cx-42,y-4],[cx+42,y-4],[cx+38,y+4],[cx-38,y+4]],true,.1));
    add('ink',0,q=>{for(let k=0;k<4;k++)q.ell(cx-30+k*20,y-1,2.5,2,.05)});
  }
  function bikes(x,y){const n=2+Math.floor(R()*2),bk=Math.floor(R()*n),bx=[];for(let k=0;k<n;k++)bx.push(x-(n-1)*34+k*68);
    add('none',2.4,q=>{q.line(x-(n-1)*34-50,y-60,x+(n-1)*34+50,y-60,.1);for(const a of[x-(n-1)*34-50,x+(n-1)*34+50])q.line(a,y-60,a,y,.1)});
    for(let k=0;k<n;k++){const a=bx[k],sh=k*6;
      add('none',1.8,q=>{q.ell(a-28,y-26-sh,24,24,.03);q.ell(a+30,y-26-sh,24,24,.03);q.poly([[a-28,y-26-sh],[a-4,y-60-sh],[a+22,y-62-sh],[a+30,y-26-sh]],false,.05);q.line(a-4,y-60-sh,a,y-26-sh,.05);q.line(a+22,y-62-sh,a+18,y-80-sh,.05);q.line(a+12,y-80-sh,a+26,y-82-sh,.05)});
      add('paper',1.2,q=>q.ell(a-6,y-66-sh,9,4,.05));
      if(k===bk){const b=a+34,bt=y-84-sh,s0=Math.max(22,36*D(y));
        if(free(b,bt+2,hr(36,y),P9(y)))spot('bike',b,bt,o=>peek(b,bt,ks(o,36,y),o,.16));
        add('paper',1.4,q=>q.poly([[b-17,bt],[b+17,bt],[b+13,bt+22],[b-13,bt+22]],true,.1));
        add('none',.8,q=>{for(let j=-1;j<=1;j++)q.line(b+j*8,bt+2,b+j*7,bt+20,.05);q.line(b-15,bt+10,b+15,bt+10,.05)})}}
  }
  function cart(x,y){const d=R()<.5?-1:1,cx=x+rr(-30,30);
    add('paper',1.8,q=>{q.ell(x-40,y-18,17,17,.03);q.ell(x+40,y-18,17,17,.03)});
    add('none',2,q=>{q.line(x-58,y-150,x-58,y-80,.1);q.line(x+58,y-150,x+58,y-80,.1);q.line(x+d*66,y-70,x+d*96,y-86,.1)});
    add('paper',1.8,q=>q.poly([[x-72,y-150],[x+72,y-150],[x+60,y-172],[x-60,y-172]],true,.2));
    add('shade',0,q=>{for(let k=-3;k<3;k+=2)q.poly([[x+k*24,y-150],[x+(k+1)*24,y-150],[x+(k+1)*20,y-172],[x+k*20,y-172]],true,.05)});
    add('paper',1.2,q=>{for(let k=0;k<4;k++)q.rect(x-50+k*26,y-112,20,26,.05)});
    if(free(cx,y-78,hr(40,y),P9(y)))spot('cart',cx,y-80,o=>peek(cx,y-80,ks(o,40,y),o,.14));
    add('paper',2,q=>q.rect(x-66,y-80,132,52,.3));
    add('none',.9,q=>{q.line(x-56,y-64,x+56,y-64,.1);q.ell(x,y-50,12,8,.05)});
  }
  function bin(x,y){
    if(free(x,y-72,hr(40,y),P9(y)))spot('bin',x,y-74,o=>peek(x,y-74,ks(o,40,y),o,.16));
    add('paper',2,q=>q.poly([[x-20,y-74],[x+20,y-74],[x+17,y],[x-17,y]],true,.2));
    add('none',.9,q=>{q.line(x-19,y-60,x+19,y-60,.1);for(let k=-1;k<=1;k++)q.line(x+k*9,y-54,x+k*8,y-6,.05)});
    add('paper',1.6,q=>q.ell(x,y-75,22,5,.05));
  }
  // končetina / nohavice jako čtyřúhelník podél úsečky (šířka w)
  const limb=(q,x1,y1,x2,y2,w,w2=w)=>{const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,nx=-dy/l/2,ny=dx/l/2;qp(q,[[x1+nx*w,y1+ny*w],[x2+nx*w2,y2+ny*w2],[x2-nx*w2,y2-ny*w2],[x1-nx*w,y1-ny*w]])};
  // turista: v 0 batoh, 1 fotí, 2 s taškou, 3 dítě s balónkem, 4 klobouk, 5 selfie tyč; d směr, krok nebo stoj
  function person(x,y,v,d){const k=v===3?.62:1,h=176*k,hr2=11.5*k,sy=y-h+hr2*2+2,hy=y-h*.47,step=R()<.55,coat=R()<.5,hair=R();
    const ft=step?[-d*15*k,d*17*k]:[-6*k,6*k],ar=[];
    if(v===1)ar.push([x-13*k,sy+8,x+d*8,sy-10],[x+13*k,sy+8,x+d*14,sy-8]);
    else if(v===5)ar.push([x-d*13*k,sy+8,x-d*18*k,hy+4],[x+d*13*k,sy+8,x+d*40,sy-36]);
    else if(v===3)ar.push([x-d*12*k,sy+6,x-d*16*k,hy+2],[x+d*12*k,sy+6,x+d*24*k,sy-26*k]);
    else{const sw=step?10*k:2*k;ar.push([x-13*k,sy+8,x-17*k-d*sw,hy+6],[x+13*k,sy+8,x+17*k+d*sw,hy+6])}
    if(v===0)add('paper',1.5,q=>qb(q,x-d*22*k-9,sy+6,18,46*k));
    add('paper',1.5,q=>{for(let i=0;i<2;i++){const a=x+(i?6:-6)*k;limb(q,a,hy,x+ft[i],y-4,12*k,8*k)}});
    add('ink',0,q=>{for(const f of ft)qe(q,x+f+d*3*k,y-3,7*k,3.5*k,6)});
    add('paper',1.7,q=>qp(q,coat?[[x-17*k,hy+14*k],[x+17*k,hy+14*k],[x+14*k,sy+6],[x+8*k,sy],[x-8*k,sy],[x-14*k,sy+6]]:[[x-14*k,hy+2],[x+14*k,hy+2],[x+15*k,sy+6],[x+8*k,sy],[x-8*k,sy],[x-15*k,sy+6]]));
    add('paper',1.2,q=>{for(const[a,b,c,e]of ar)limb(q,a,b,c,e,8*k,6*k)});
    add('paper',1.5,q=>qe(q,x,y-h+hr2,hr2*.92,hr2*1.08,10));
    if(hair<.5)add('shade',1.2,q=>q.curve([[x-hr2,y-h+hr2*1.1],[x-hr2*1.05,y-h+hr2*.2],[x,y-h-1],[x+hr2*1.05,y-h+hr2*.2],[x+hr2,y-h+hr2*1.1],[x+d*hr2*.3,y-h+hr2*.5]],true));
    else add('none',1.2,q=>q.curve([[x-hr2,y-h+hr2],[x-hr2*.4,y-h-1],[x+hr2*.8,y-h+2],[x+hr2,y-h+hr2*.8]],false));
    if(v===1)add('paper',1.4,q=>qb(q,x+d*10-7,sy-20,14,10));
    if(v===5){add('none',1.4,q=>q.line(x+d*40,sy-36,x+d*72,sy-84,.1));add('paper',1.2,q=>qb(q,x+d*72-5,sy-98,10,16))}
    if(v===2)add('paper',1.4,q=>qb(q,x+17*k+(step?d*10*k:2*k)-6,hy,18,22));
    if(v===3){add('none',1,q=>q.curve([[x+d*24*k,sy-26*k],[x+d*30,sy-60],[x+d*26,y-h-70]],false));add('paper',1.5,q=>qe(q,x+d*26,y-h-88,15,19,10))}
    if(v===4)add('paper',1.5,q=>{qe(q,x,y-h+3,20,4.5,10);qb(q,x-10,y-h-11,20,14)});
  }
  // pouliční malíř u stojanu s obrazem Hradu
  function painter(x,y){const d=R()<.5?-1:1,ex=x+d*50,ct=y-190;
    person(x-d*30,y,4,d);
    add('none',2.2,q=>{q.line(ex-30,y,ex-4,ct-10,.1);q.line(ex+30,y,ex+4,ct-10,.1);q.line(ex,ct,ex+d*6,y-4,.1);q.line(ex-26,y-60,ex+26,y-60,.1)});
    if(free(ex,ct+4,hr(40,y),P9(y)))spot('painter',ex,ct,o=>peek(ex,ct,ks(o,40,y),o,.16));
    add('paper',1.8,q=>qb(q,ex-46,ct,92,70));
    add('none',1,q=>{q.poly([[ex-42,ct+46],[ex-30,ct+46],[ex-30,ct+36],[ex-14,ct+36],[ex-12,ct+22],[ex-10,ct+8],[ex-8,ct+22],[ex-4,ct+22],[ex-2,ct+10],[ex,ct+22],[ex+8,ct+24],[ex+10,ct+14],[ex+12,ct+4],[ex+14,ct+14],[ex+16,ct+24],[ex+32,ct+26],[ex+32,ct+38],[ex+42,ct+38]],false,.1);ql(q,ex-42,ct+52,ex+42,ct+52);q.curve([[ex-40,ct+60],[ex-20,ct+57],[ex,ct+60],[ex+20,ct+57],[ex+40,ct+60]],false)});
    add('paper',1.3,q=>q.curve([[ex+d*50,y-6],[ex+d*80,y-14],[ex+d*96,y-4],[ex+d*70,y+4]],true));
    add('ink',0,q=>{for(let k=0;k<3;k++)qe(q,ex+d*(62+k*10),y-5,2.5,2.5,6)});
  }
  // veterán na vyhlídkové jízdě: otevřený vůz s blatníky a řidičem, kočka kouká přes dvířka zadního sedadla
  function oldcar(x,y,d){const X=u=>x+d*u,bt=y-86;
    add('paper',1.8,q=>qb(q,Math.min(X(-104),X(-64)),bt-34,40,36));
    add('paper',1.6,q=>{qp(q,[[X(-4),bt+4],[X(22),bt+4],[X(20),bt-30],[X(-2),bt-30]]);qe(q,X(9),bt-44,11,12,10)});
    add('paper',1.4,q=>{qe(q,X(9),bt-52,13,4,8);qb(q,X(9)-9,bt-60,18,8)});
    add('none',2.4,q=>{ql(q,X(4),bt-16,X(34),bt-12);qe(q,X(36),bt-12,8,8,8)});
    const cx=X(-78);if(free(cx,bt+2,hr(40,y),P9(y)))spot('oldcar',cx,bt,o=>peek(cx,bt,ks(o,40,y),o,.16));
    add('paper',2.2,q=>qp(q,[[X(-128),y-34],[X(-126),bt],[X(-40),bt-2],[X(40),bt+4],[X(112),y-70],[X(126),y-40]]));
    add('shade',0,q=>qp(q,[[X(-124),y-56],[X(122),y-50],[X(124),y-42],[X(-126),y-44]]));
    add('none',1.2,q=>{ql(q,X(-40),bt,X(-40),y-36);ql(q,X(-36),bt+18,X(-26),bt+18);ql(q,X(40),bt+4,X(30),bt-40);ql(q,X(30),bt-40,X(50),bt-40);ql(q,X(50),bt-40,X(42),bt+4)});
    add('paper',2,q=>{for(const c of[-72,78])q.curve([[X(c-34),y-30],[X(c-30),y-58],[X(c),y-64],[X(c+30),y-58],[X(c+34),y-30]],true)});
    add('paper',2,q=>{qe(q,X(-72),y-24,24,24,12);qe(q,X(78),y-24,24,24,12)});
    add('none',1,q=>{for(const c of[X(-72),X(78)]){qe(q,c,y-24,8,8,6);for(let k=0;k<6;k++){const a=k*PI/3;ql(q,c+Math.cos(a)*8,y-24+Math.sin(a)*8,c+Math.cos(a)*20,y-24+Math.sin(a)*20)}}});
    add('paper',1.4,q=>{qe(q,X(124),y-66,9,9,8);qe(q,X(-128),y-62,5,7,6)});
  }
  function cyclist(x,y,d){
    add('none',2,q=>{q.ell(x-34,y-26,25,25,.03);q.ell(x+34,y-26,25,25,.03);q.poly([[x-34,y-26],[x-8,y-64],[x+24,y-64],[x+34,y-26]],false,.05);q.line(x-8,y-64,x-2,y-26,.05);q.line(x+d*24,y-64,x+d*20,y-86,.05)});
    add('none',4,q=>{q.line(x-4,y-100,x+4,y-40,.1);q.line(x-4,y-100,x-12,y-44,.1)});
    add('paper',2,q=>q.poly([[x-16,y-100],[x+10,y-100],[x+d*14+6,y-150],[x+d*14-18,y-156]],true,.2));
    add('none',2.4,q=>q.line(x+d*14,y-146,x+d*22,y-88,.1));
    add('paper',1.8,q=>q.ell(x+d*18,y-170,12,13,.05));
    add('paper',1.4,q=>q.poly([[x+d*18-14,y-176],[x+d*18+14,y-176],[x+d*18+8,y-188],[x+d*18-8,y-188]],true,.05));
  }
  function pigeons(x,y){const p=[];for(let k=0;k<3+Math.floor(R()*3);k++)p.push([x+rr(-50,50),y+rr(-6,6),R()<.5?-1:1,R()<.4]);
    add('paper',1.3,q=>{for(const[a,b,d,e]of p){qe(q,a,b-9,12,7);qe(q,a+d*10,b-(e?7:17),4.5,4.5)}});
    add('none',1,q=>{for(const[a,b,d,e]of p){q.line(a-3,b-3,a-4,b,.05);q.line(a+3,b-3,a+4,b,.05);q.line(a-d*11,b-10,a-d*20,b-6,.05);q.curve([[a-d*8,b-11],[a,b-14],[a+d*6,b-9]],false)}});
    add('ink',0,q=>{for(const[a,b,d,e]of p)q.poly([[a+d*14,b-(e?8:18)],[a+d*19,b-(e?6:17)],[a+d*14,b-(e?5:15)]],true,.05)});
  }
  function bollard(x,y){add('paper',1.8,q=>{q.rect(x-8,y-54,16,54,.1);q.ell(x,y-56,10,5,.05)});add('none',.8,q=>q.line(x-8,y-44,x+8,y-44,.05))}
  // tramvajová zastávka: přístřešek se sklem, lavička a označník
  function tstop(x,y){const w=250,h=226,bx=x+rr(-60,20),rx=x+rr(-.3,.3)*w;
    add('none',2.2,q=>{q.line(x-w/2+6,y,x-w/2+6,y-h+12,.1);q.line(x+w/2-6,y,x+w/2-6,y-h+12,.1)});
    add('none',1,q=>{q.rect(x-w/2+10,y-h+26,w-20,h-56,.2);q.line(x-w/2+30,y-h+60,x-w/2+70,y-h+100,.1);q.line(x-w/2+44,y-h+50,x-w/2+100,y-h+106,.1);q.line(x+w/2-80,y-100,x+w/2-40,y-60,.1)});
    add('paper',1.4,q=>q.rect(x+w/2-70,y-h+44,46,60,.1));
    add('none',.7,q=>{for(let k=0;k<5;k++)q.line(x+w/2-64,y-h+54+k*10,x+w/2-30,y-h+54+k*10,.05)});
    add('none',2,q=>{q.line(bx-60,y-54,bx-60,y-4,.1);q.line(bx+60,y-54,bx+60,y-4,.1)});
    add('paper',1.8,q=>q.rect(bx-76,y-62,152,11,.2));
    const s0=Math.max(22,44*D(y));
    if(free(bx,y-62-s0*.73,s0*.38,P9(y)))spot('stop',bx,y-62,o=>sitCat(bx,y-61,ks(o,44,y),o));
    add('paper',2,q=>q.rect(x-w/2-12,y-h,w+24,16,.3));
    const s1=Math.max(22,38*D(y));
    if(free(rx,y-h-s1*.3,s1*.33,P9(y)))spot('stop',rx,y-h,o=>loafCat(rx,y-h+1,ks(o,38,y),o));
    const px=x+w/2+36;
    add('none',2.6,q=>q.line(px,y,px,y-236,.1));
    add('paper',1.8,q=>{q.rect(px-16,y-250,32,36,.1);q.rect(px-14,y-206,28,22,.1)});
    add('none',1.2,q=>{q.poly([[px-8,y-240],[px+8,y-240],[px+8,y-224],[px-8,y-224]],true,.05);q.line(px,y-240,px,y-248,.05)});
  }
  // tramvaj: v < .45 T3, < .7 souprava dvou T3, jinak Škoda 15T; dir = směr jízdy
  function tram(cx,b,len,v,dir){const x0=cx-len/2,x1=cx+len/2,tc=R()<.5,wc=[];
    const car=(a0,a1,top,bot,front,rear,nose)=>{
      add('shade',1.4,q=>{for(const u of[.18,.82])q.rect(a0+(a1-a0)*u-45,bot-4,90,24,.2)});
      add('paper',1.4,q=>{for(const u of[.18,.82])for(const e of[-24,24])q.ell(a0+(a1-a0)*u+e,b-12,12,12,.05)});
      const body=nose?[[a0,bot],[a0,top+40],[a0+14,top],[a1-60,top],[a1-8,top+70],[a1,bot]]:rbox(a0,top,a1,bot,40);
      const bd=dir>0||!nose?body:body.map(([x,y])=>[a0+a1-x,y]);
      add('paper',2.4,q=>q.poly(bd,true,.3));
      add('shade',1.2,q=>q.rect(a0+6,bot-52,a1-a0-12,40,.1));
      add('none',1.2,q=>{q.line(a0+4,bot-58,a1-4,bot-58,.1);q.line(a0+4,top+112,a1-4,top+112,.1)});
      // okna a dveře
      const wt=top+22,wb=top+100,dp=[.17,.5,.83].map(u=>a0+(a1-a0)*u),win=[];
      for(let a=a0+56;a<a1-110;a+=74){if(dp.some(d=>Math.abs(d-(a+32))<60))continue;win.push(a)}
      add('shade',1.2,q=>{for(const a of win)q.rect(a,wt,64,wb-wt,.1);for(const d of dp)q.rect(d-28,wt,56,bot-60-wt,.1)});
      add('none',1.2,q=>{for(const d of dp){q.line(d,wt,d,bot-60,.05);q.line(d-28,wb+10,d+28,wb+10,.05)}});
      const fe=dir>0?a1:a0;
      add('shade',1.2,q=>q.poly(dir>0?[[fe-50,wt],[fe-10,wt],[fe-4,wb+10],[fe-50,wb+10]]:[[fe+50,wt],[fe+10,wt],[fe+4,wb+10],[fe+50,wb+10]],true,.1));
      if(front)add('paper',1.4,q=>{q.ell(fe-dir*20,bot-30,7,7,.05);q.rect(fe-dir*44-18,top+6,36,14,.05)});
      for(const a of win)wc.push([a+32,wb]);
      add('paper',.9,q=>{for(const a of win)q.rect(a-2,wb,68,4,.05)});
      return{top,a0,a1}};
    let tops=[];
    if(v<.45)tops.push(car(x0,x1,b-230,b-26,true,true,false));
    else if(v<.7){const m=cx;tops.push(car(x0,m-10,b-230,b-26,dir<0,true,false));tops.push(car(m+10,x1,b-230,b-26,dir>0,true,false));add('none',3,q=>q.line(m-12,b-60,m+12,b-60,.1))}
    else{tops.push(car(x0,x1,b-226,b-20,true,true,true));add('none',1.6,q=>{for(const u of[.34,.66]){const a=x0+len*u;q.line(a-5,b-222,a-5,b-22,.1);q.line(a+5,b-222,a+5,b-22,.1)}})}
    // kočky v oknech (jen uvnitř obrazu)
    const ok=wc.filter(([a])=>a>70&&a<W-70);
    for(let i=0;i<Math.min(3,ok.length);i++){const[a,wb]=ok[Math.floor(R()*ok.length)];if(free(a,wb,hr(44,b),P9(b)))spot('tram',a,wb,o=>peek(a,wb,ks(o,44,b),o,.1))}
    // sběrač a střešní skříně; kočka na střeše
    for(const t of tops){const pc=(t.a0+t.a1)/2+(tc?-40:40),top=t.top;
      add('paper',1.6,q=>{q.rect(pc-40,top-12,80,12,.1);q.rect(t.a0+50,top-10,70,10,.1)});
      add('none',1.6,q=>{q.line(pc-30,top-12,pc,top-66,.05);q.line(pc,top-66,pc+30,top-12,.05);q.line(pc-44,top-68,pc+44,top-68,.05)});
      // střešní skříň (klimatizace); kočka leží za ní, hlava vykukuje za jejím koncem
      const rx=pc+(tc?110:-110)*(t.a1-t.a0>700?1.4:1),dd=tc?1:-1,cx=rx+dd*38,s0=Math.max(22,40*D(b));
      if(rx>80&&rx<W-80&&free(cx+dd*20,top-s0*.3,s0*.33,P9(b)))spot('tramroof',cx,top,o=>loafCat(o.kitten?cx+dd*10:cx,top+1,ks(o,40,b),Object.assign({},o,{dir:dd})));
      add('paper',1.6,q=>{q.poly(rbox(rx-52,top-26,rx+52,top+1,8),true,.1)});
      add('none',.9,q=>{for(let k=-3;k<=3;k++)ql(q,rx+k*12,top-20,rx+k*12,top-6)})}
  }

  /* ---------- sestavení ---------- */
  function panorama(){
    // PLÁN (před kreslením): popředí, lodě, domy a zákryty, aby úkryty vzadu věděly, co je zakryje
    const pil=[];{const ph=R()<.5?0:1;let i=0;for(let x=rr(90,180);x<2640;x+=rr(260,310),i++)pil.push({x,lamp:i%2===ph,ball:R()<.3,cat:R()<.6})}
    const L=layout({gap:18,depth:46,cover:.3});
    for(const p of pil){L.block(p.x,1500,p.lamp?44:64,p.lamp?340:130);occ(p.x-26,p.x+26,PT-48,PT+60,O.quay);if(p.lamp)occ(p.x-8,p.x+8,PT-330,PT-48,O.quay)}
    const tv=R(),tlen=tv<.45?640:tv<.7?1240:1060,tdir=R()<.5?-1:1,tcx=rr(tlen/2+40,W-tlen/2-40);
    L.put((x,y)=>tram(x,y,tlen,tv,tdir),tcx,TY,tlen,250);occ(tcx-tlen/2,tcx+tlen/2,TY-240,TY,P9(TY));
    L.block(tcx,TY-230,tlen+60);   // nic z promenády nesmí stát patou na linii střechy tramvaje (vypadalo by to, že stojí na ní)
    const promo=(f,w,h,y0,y1,x0,x1)=>{const p=L.tryPut(f,w,h,y0,y1,x0,x1);if(p)occ(p.x-w/2,p.x+w/2,p.y-h,p.y,P9(p.y));return p};
    promo(tstop,300,250,1682,1694);
    for(const[a,b]of[[70,420],[1000,2560]]){const cr=rr(110,130),p=L.tryPut((x,y)=>linden(x,y,cr),60,cr*1.6+180,1528,1566,a,b);
      if(p){const cy=p.y-180-cr*.6;occ(p.x-cr*1.45,p.x+cr*1.45,cy-cr*1.2,cy+cr*1.1,P9(p.y));occ(p.x-16,p.x+16,cy,p.y,P9(p.y))}}
    promo(painter,200,240,1540,1690);
    const PR=[[kiosk,200,250],[cafe,230,220],[cafe,230,220],[benchP,220,110],[benchP,220,110],[benchP,220,110],[busker,200,200],[bikes,240,110],[cart,160,175],[bin,44,84],[pot,70,110]];
    for(const[f,w,h]of PR)promo(f,w,h,1540,1690);
    for(let i=0;i<9;i++){const v=Math.floor(R()*6),d=R()<.5?-1:1,h=v===3?200:190;promo((x,y)=>person(x,y,v,d),v===5?90:56,h,1540,1690)}
    {const d=R()<.5?-1:1;promo((x,y)=>cyclist(x,y,d),130,200,1760,1790)}
    {const d=R()<.5?-1:1;promo((x,y)=>oldcar(x,y,d),280,150,1766,1796)}
    for(let i=0;i<2;i++)promo(pigeons,110,24,1560,1690);
    for(let i=0;i<3;i++)promo(bollard,30,60,1940,1975);
    for(let i=0;i<2;i++)promo(pigeons,110,24,1940,1985);
    promo(pot,70,110,1945,1975);promo(bin,44,84,1945,1975);promo(pot,70,110,1945,1975);
    for(let i=0;i<4;i++){const v=Math.floor(R()*6),d=R()<.5?-1:1;promo((x,y)=>person(x,y,v,d),v===5?90:56,200,1950,1985)}
    // lodě na Vltavě před mostem
    const WL=layout({gap:26,depth:34,cover:.4});
    const front=x=>x<775?1080:watY(x)+30*sAt(x);   // před mostem a ledolamy
    const water=(f,bw,bh,y0,y1)=>{for(let i=0;i<24;i++){const y=rr(y0,y1),d=D(y),w=bw*d,h=bh*d,x=rr(w/2+30,2700-w/2);
        if(Math.max(front(x-w/2),front(x),front(x+w/2))>y-8)continue;
        if(WL.put((X,Y)=>f(X,Y,w,d),x,y,w,h)){occ(x-w/2,x+w/2,y-h,y,O.boat);return true}}return false};
    for(let i=0;i<3;i++){const v=Math.floor(R()*3),dir=R()<.5?-1:1;water((x,y,w,d)=>boat(x,y,w,d,v,dir),i?460:560,v===1?150:110,1150,1420)}
    for(let i=0;i<3;i++){const v=Math.floor(R()*3),dir=R()<.5?-1:1;water((x,y,w,d)=>pedalo(x,y,w,d,v,dir),110,80,1150,1400)}
    {const dir=R()<.5?-1:1;water((x,y,w,d)=>rowboat(x,y,w,d,dir),130,40,1120,1430)}
    for(let i=0;i<4;i++){const dir=R()<.5?-1:1;water((x,y,w,d)=>swan(x,y,dir,d),50,50,1100,1430)}
    water((x,y,w,d)=>ducks(x,y,d),80,20,1090,1430);
    // Kampa a mlýn
    const MX=rr(610,670),KT=[];{let kc=Math.floor(R()*5);for(let x=rr(20,70);x<700;x+=rr(110,160)){if(Math.abs(x-MX)<120)continue;const r=rr(52,68);KT.push({x,r,cat:kc--===0});occ(x-r,x+r,1004-r*1.6,1062,O.kampa)}}
    occ(MX-50,MX+110,936,1064,O.kampa);
    // Malostranské věže, most, Staroměstská věž
    occ(796,912,588,975,O.mst);occ(700,810,812,975,O.mst);
    for(let x=BA[0];x<BB[0];x+=50){const s=sAt(x+25);occ(x,x+50,parY(x+25)-32*s,1500,O.bridge)}
    for(let i=1;i<NA;i++){const s=bs(i/NA),x=BP(i/NA)[0];occ(x-12*s,x+12*s,parY(x)-120*s,parY(x),O.bridge)}
    occ(-10,W+10,PT-34,PT+60,O.quay);
    occ(2736,3030,748,1500,O.oldt);occ(2700,2744,690,1500,O.oldt);occ(2790,2980,580,748,O.oldt);occ(2724,2762,636,748,O.oldt);occ(2690,3030,610,752,O.oldt);
    // domy Malé Strany ve třech řadách (vzadu menší)
    const HS=[],ROWS=[{b:852,sc:.5,x0:380,x1:2790,o:O.row0},{b:926,sc:.58,x0:-40,x1:2790,o:O.row1},{b:996,sc:.66,x0:-40,x1:2790,o:O.row2}];
    for(const r of ROWS){let x=r.x0+rr(-50,0);
      while(x<r.x1){const low=r.o===O.row0&&x>1250&&x<2650,w=rr(170,290)*r.sc,fh=(low?rr(120,170):rr(160,250))*r.sc,rt=Math.floor(R()*4),rh=(rt===1?rr(50,80):rr(36,70))*r.sc;
        let b=r.b+rr(-6,6);if(r.o===O.row0&&x<900)b-=(900-x)*.2;
        HS.push({x,w,b,fh,rh,rt,sc:r.sc,o:r.o});const t=b-fh;
        // zákryt podle tvaru střechy: sedlová celá, mansarda dole celá, valba a štít se zužují
        if(rt===3)occ(x-4,x+w+4,t-rh,b,r.o);
        else if(rt===2){occ(x-4,x+w+4,t-rh*.62,b,r.o);occ(x+w*.2,x+w*.8,t-rh,t,r.o)}
        else{const rk=rt===1?1.3:1;occ(x-4,x+w+4,t-rh*.45*rk,b,r.o);occ(x+w*.12,x+w*.88,t-rh*.75*rk,t,r.o);occ(x+w*.25,x+w*.75,t-rh*rk-6,t,r.o)}
        x+=w+rr(-4,2)*r.sc}}
    occ(966,1114,470,930,O.nic);occ(870,1190,700,930,O.nic);occ(1186,1242,540,930,O.nic);
    const CT=2330;occ(CT-40,CT+40,640-120,900,O.church);
    const RW=[O.row0,O.row1,O.row2].map(o=>prepRow(HS.filter(h=>h.o===o)));

    // KRESLENÍ odzadu dopředu
    sky();letna();const PP=petrin();strahov(PP);castleHill();
    vitus();george();castle();hradcanyWest();eastEnd();gardens();
    houseRow(RW[0]);
    nicholas();churchTower(CT,900,260,.58);
    houseRow(RW[1]);houseRow(RW[2]);
    river();kampa(KT,MX);msTowers();bridge();
    WL.place();
    oldTower();pavement();quay(pil);street();
    L.place();
  }
  panorama();
}});
