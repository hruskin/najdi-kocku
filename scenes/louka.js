// Louka u lesa: hory a kopce s poli, les v několika plánech, louka s cestou v perspektivě,
// potok s mostkem, rybník s mólem a loďkou, seník, ohrada s ovcemi, úly, krmelec, posed a rozcestník.
// Prostředí se registruje přes SCENE(); build(K) dostane sdílené nástroje z jádra (index.html).
SCENE({id:"louka",ver:4,name:"Louka u lesa",where:"v korunách stromů, v rákosí, na posedu i ve vysoké trávě",
  // kolik koček smí mít jeden druh úkrytu (neuvedený druh = 1)
  caps:{understand:1,underbench:1,blanket:1,wagon:1,underwagon:1,forest:1,stream:1,shore:1,tree:3,spruce:2,birch:1,hollow:1,trunk:2,branch:1,stand:1,feeder:1,trough:1,woodpile:1,barndoor:1,loft:1,roof:1,
    hive:1,sheep:2,fence:2,sign:1,bench:1,basket:1,barrow:1,bridge:1,bridgetop:1,reeds:2,jetty:1,boat:1,hay:2,stump:2,
    log:1,loghole:1,logtop:1,grass:2,flowers:2,bush:2,stone:1,fern:1},
build(K){
  const{R,rr,add,S,reg,head,sitCat,loafCat,sleepCat,peekCat,place,stand,sky,tree,bush,shrooms,bench}=K;
  const FE=1120;                                                     // okraj lesa, odtud začíná louka
  // úkryty si pamatujeme, aby motýli nepřistáli kočce na hlavě
  const SP=[],spot=(k,x,y,f)=>{SP.push([x,y]);K.spot(k,x,y,f)};
  let avoid=[];                                                      // x stromů, které se nakreslí přes právě kreslenou korunu
  const pk=y=>Math.max(.6,Math.min(1.12,.62+.5*(y-FE)/(H-FE)));      // měřítko podle hloubky
  const sgn=()=>R()<.5?-1:1;
  // rovná čárka bez roztřesení (husté textury; nevolá RNG, šetří čas sestavení)
  // ovál z mála bodů (levnější než q.ell pro stovky drobností)
  const blob=(q,cx,cy,rx,ry,n=8,j=.08,rot=0)=>{const a0=R()*6.283,p=[],c=Math.cos(rot),sn=Math.sin(rot);for(let i=0;i<n;i++){const a=a0+i/n*6.283,k=1+(R()-.5)*2*j,u=Math.cos(a)*rx*k,v=Math.sin(a)*ry*k;p.push([cx+u*c-v*sn,cy+u*sn+v*c])}q.curve(p,true)};
  const ln=(q,x1,y1,x2,y2)=>{q.p.moveTo(x1,y1);q.p.lineTo(x2,y2);q.bb(x1,y1);q.bb(x2,y2)};
  // drobný ovál bez roztřesení (kvítka v trávě; nevolá RNG)
  const dot=(q,x,y,rx,ry)=>{const p=q.p;p.moveTo(x+rx,y);p.quadraticCurveTo(x+rx,y+ry,x,y+ry);p.quadraticCurveTo(x-rx,y+ry,x-rx,y);p.quadraticCurveTo(x-rx,y-ry,x,y-ry);p.quadraticCurveTo(x+rx,y-ry,x+rx,y);p.closePath();q.bb(x-rx,y-ry);q.bb(x+rx,y+ry)};

  /* pozadí: hory, kopec s poli, les */
  function ridge(yb,amp,step,f){const o=R()*6,pts=[];
    for(let x=0;x<W+step;x+=step){x=Math.min(x,W);pts.push([x,yb+Math.sin(x/f+o)*amp+Math.sin(x/(f*.37)+o*2)*amp*.35+rr(-5,5)])}return pts}
  const yOn=(pts,x)=>{for(let i=1;i<pts.length;i++)if(pts[i][0]>=x){const a=pts[i-1],b=pts[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])}return pts[pts.length-1][1]};
  const land=(pts,yb,lw)=>add('paper',lw,q=>{q.curve(pts,false);q.p.lineTo(W,yb);q.p.lineTo(0,yb);q.p.closePath();q.bb(0,yb);q.bb(W,yb)});
  function mountains(){
    const far=[],pk2=[];let x=0,up=R()<.5;while(x<W){const y=up?rr(400,470):rr(500,540);far.push([x,y]);if(up)pk2.push(far.length-1);x=Math.min(W,x+rr(140,260));up=!up}far.push([W,rr(480,520)]);
    add('paper',1.4,q=>{q.poly(far,false,1.2);q.p.lineTo(W,1000);q.p.lineTo(0,1000);q.p.closePath();q.bb(0,1000);q.bb(W,1000)});
    add('shade',0,q=>{for(const i of pk2){if(i+1>=far.length)continue;const[a,b]=far[i],[c,d]=far[i+1];q.poly([[a,b+4],[c-4,d],[c-10,d+70],[a+(c-a)*.3,b+110]],true,.8)}});
    add('none',1,q=>{for(const i of pk2){const[a,b]=far[i];for(let k=1;k<4;k++)q.line(a,b+k*6,a-rr(20,50),b+k*6+rr(30,60),.4)}});
    const r1=ridge(rr(600,630),32,100,420);land(r1,1000,1.8);
    // lesnatý hřbet: drobné smrčky v pásech
    add('none',1,q=>{let x=rr(8,60);while(x<W-20){const run=rr(220,650);
      for(let xx=x;xx<Math.min(W-8,x+run);xx+=rr(9,14)){const y=yOn(r1,xx)+rr(0,8),h=rr(14,26);q.poly([[xx-6,y+6],[xx,y-h],[xx+6,y+6]],false,.3)}x+=run+rr(80,320)}});
  }
  function fields(){const r2=ridge(rr(685,710),24,120,520);land(r2,1000,2);
    const cut=[];let x=0;while(x<W-60){cut.push(x);x+=rr(180,380)}cut.push(W);
    const bx=(c,y)=>Math.max(0,Math.min(W,c+(c-1500)*.35*(y-yOn(r2,c))/(1000-yOn(r2,c))));   // hranice polí se sbíhají k divákovi
    add('none',1.2,q=>{for(const c of cut)if(c>0&&c<W)q.line(c,yOn(r2,c)+3,bx(c,1000),1000,.6)});
    for(let i=0;i<cut.length-1;i++){const a=cut[i],b=cut[i+1],t=R();if(b-a<60)continue;
      if(t<.3)add('none',.9,q=>{const n=Math.round((b-a)/16);for(let k=1;k<n;k++){const c=a+(b-a)*k/n;q.line(c,yOn(r2,c)+8,bx(c,1000),1000,.4)}});
      else if(t<.52)add('none',.9,q=>{const ya=Math.max(yOn(r2,a),yOn(r2,b))+12;for(let y=ya;y<990;y+=rr(11,16))q.line(bx(a,y)+4,y,bx(b,y)-4,y,.4)});
      else if(t<.68)add('shade',1,q=>{const top=[[a+3,yOn(r2,a)+8]];for(const p of r2)if(p[0]>a+3&&p[0]<b-3)top.push([p[0],p[1]+8]);top.push([b-3,yOn(r2,b)+8]);
        q.poly(top.concat([[bx(b,1000)-3,1000],[bx(a,1000)+3,1000]]),true,.4)});
      else if(t<.84)add('none',1.2,q=>{for(let y=Math.max(yOn(r2,a),yOn(r2,b))+14;y<990;y+=14)for(let c=bx(a,y)+8;c<bx(b,y)-8;c+=rr(14,22))ln(q,c-2,y,c+2,y-1)});
      else add('paper',1.1,q=>{for(let k=0;k<3;k++){const c=rr(a+30,b-30),y=yOn(r2,c)+rr(30,80);q.ell(c,y-6,9,7,.1)}});
    }
    // vesnička s kostelem a solitérní stromky na mezích
    const vx=rr(300,W-300),vy=yOn(r2,vx)+rr(40,60);
    add('paper',1.4,q=>{q.rect(vx-30,vy-26,60,26,.3);q.rect(vx+30,vy-52,16,52,.3)});
    add('paper',1.4,q=>{q.poly([[vx-34,vy-26],[vx-10,vy-44],[vx+30,vy-44],[vx+30,vy-26]],true,.3);q.poly([[vx+28,vy-52],[vx+38,vy-86],[vx+48,vy-52]],true,.3)});
    add('none',1,q=>{q.line(vx+38,vy-86,vx+38,vy-98,.1);q.line(vx+34,vy-93,vx+42,vy-93,.1);q.ell(vx+38,vy-42,3,4,.1)});
    for(let i=0;i<4;i++){const hx=vx+(i<2?-1:1)*rr(70,150)+(i%2)*40,hy=vy+rr(-6,14),hw=rr(24,34);
      add('paper',1.3,q=>{q.rect(hx-hw/2,hy-18,hw,18,.3);q.poly([[hx-hw/2-4,hy-18],[hx,hy-34],[hx+hw/2+4,hy-18]],true,.3)})}
    add('paper',1.2,q=>{for(let k=0;k<9;k++){const c=pickCut(cut),y=yOn(r2,c)+rr(20,90),x=bx(c,y);q.ell(x,y-14,8,9,.1)}});
    add('none',1,q=>{for(let k=0;k<9;k++){const c=pickCut(cut),y=yOn(r2,c)+rr(20,90),x=bx(c,y);q.line(x,y,x,y-6,.1)}});
  }
  const pickCut=c=>c[1+Math.floor(R()*(c.length-2))];
  // les v pozadí: zubatá linie korun, pod ní tmavé nitro lesa se světlými kmeny
  function forestBack(){const o=R()*6,top=[],b0=x=>935+Math.sin(x/260+o)*24+Math.sin(x/97+o)*8;let x=0;
    while(x<W-30){const b=b0(x);
      if(R()<.55){const w=rr(38,64),h=rr(70,120);top.push([x,b],[x+w*.25,b-h*.45],[x+w*.5,b-h],[x+w*.75,b-h*.45]);x+=w}
      else{const w=rr(70,120),h=rr(40,70);for(let k=0;k<6;k++){const a=k/6*Math.PI;top.push([x+w/2-Math.cos(a)*w/2,b-Math.sin(a)*h])}x+=w}}
    for(const p of top)p[0]=Math.min(p[0],W);top.push([W,b0(W)]);
    add('paper',1.8,q=>q.poly(top.concat([[W,FE+40],[0,FE+40]]),true,.6));
    add('none',1,q=>{for(let i=0;i<170;i++){const x=rr(10,W-10),y=b0(x)+rr(-30,70);q.curve([[x-6,y],[x,y-4],[x+6,y]],false)}});
    const ub=[];for(let x=0;x<W;x+=rr(24,50))ub.push([x,b0(x)+rr(70,100)]);ub.push([W,b0(W)+80]);
    add('shade',1.2,q=>q.poly(ub.concat([[W,FE+40],[0,FE+40]]),true,1.2));
    add('paper',1,q=>{for(let x=rr(0,30);x<W;x+=rr(22,55)){const w=rr(5,11),y=yOn(ub,x)-8;q.rect(x-w/2,y,w,FE+40-y,.4)}});
  }

  /* stromy */
  // koruna z kuliček se stínem dole; kočka vykukuje mezi listím
  function crown(cx,cy,rw,rh,sc,kind,bs=1){const n=kind?Math.round(rr(8,10)):Math.round(rr(6,7)),bl=[];
    for(let i=0;i<n;i++){const a=R()*6.283,d=Math.sqrt(R());bl.push([Math.max(-30,Math.min(W+30,cx+Math.cos(a)*d*rw*.72)),cy+Math.sin(a)*d*rh*.66,rr(.3,.42)*rw*bs])}
    bl.sort((a,b)=>a[1]-b[1]);
    for(const b of bl)add('paper',2,q=>blob(q,b[0],b[1],b[2]*1.04,b[2]*.88,11,.06));
    add('shade',0,q=>{for(const b of bl.slice(-3))blob(q,b[0]+b[2]*.1,b[1]+b[2]*.38,b[2]*.62,b[2]*.32,7)});
    add('none',1,q=>{const m=Math.round(rw*rh/(kind?650:1100));for(let i=0;i<m;i++){const a=R()*6.283,d=Math.sqrt(R()),x=cx+Math.cos(a)*d*rw*.85,y=cy+Math.sin(a)*d*rh*.75;q.curve([[x-6*sc,y],[x,y-5*sc],[x+6*sc,y]],false)}});
    if(!kind)return;
    // hlava kočky na nejvyšší kuličce, u velké koruny i na boční; kolem pár lístků
    // vybrat kuličku daleko od sousedních stromů, které se kreslí později (zakryly by ji)
    // avoid = [x, poloviční šířka koruny] stromů vpředu; bez volné kuličky kočka v koruně není
    const far=b=>Math.min(1e9,...avoid.map(([ax,hw])=>Math.abs(ax-b[0])-hw)),ok=bl.filter(b=>far(b)>30*sc);
    if(!ok.length)return;
    const tb=ok.reduce((m,b)=>b[1]-b[2]<m[1]-m[2]?b:m),hs=[tb],lr=20*sc;
    if(rw>150*sc){const side=ok.filter(b=>Math.abs(b[0]-tb[0])>rw*.55&&b[1]<cy+rh*.1);if(side.length)hs.push(side[0])}
    for(const hb of hs){const tx=hb[0]+rr(-.3,.3)*hb[2],ty=hb[1]-hb[2]*.15;
      spot(kind,tx,ty,o=>{const r=S(o,46*sc)*.4;head(tx,ty,r,o);reg(o,tx,ty-r*.3,r*1.3)});
      add('paper',1.4,q=>{q.ell(tx-lr*1.1,ty+lr*.9,lr*.62,lr*.5,.1);q.ell(tx+lr*1.15,ty+lr*.8,lr*.58,lr*.48,.1)});
      add('none',1,q=>{for(const sd of[-1,1])q.curve([[tx+sd*lr*1.5,ty+lr*.8],[tx+sd*lr*1.1,ty+lr*.6],[tx+sd*lr*.7,ty+lr*.9]],false)})}
  }
  function leafy(cx,b,sc,kind){const th=rr(150,210)*sc,tw=rr(11,16)*sc,cw=rr(125,155)*sc,ch=rr(110,140)*sc,cy=b-th-ch*.3;
    // kočka sedí u kmene obličejem ven, za kmenem je jen ocas a kus boku
    if(kind&&R()<.45){const d=sgn(),sx=cx+d*(tw+17*sc);spot('trunk',sx,b,o=>sitCat(sx,b,S(o,46*sc),Object.assign({},o,{dir:d})))}
    add('paper',2.2,q=>q.poly([[cx-tw-8*sc,b],[cx-tw*.7,b-th],[cx+tw*.7,b-th],[cx+tw+8*sc,b]],true,.6));
    add('none',1.8,q=>{q.line(cx,b-th*.8,cx-50*sc,b-th-30*sc,.5);q.line(cx,b-th*.9,cx+46*sc,b-th-40*sc,.5)});
    add('none',1,q=>{for(let i=0;i<4;i++){const y=b-rr(15,th-10);q.line(cx+rr(-5,5)*sc,y,cx+rr(-5,5)*sc,y-rr(12,24)*sc,.3)}});
    crown(cx,cy,cw,ch,sc,kind);
  }
  function spruce(cx,b,sc,kind){const h=rr(360,460)*sc,w=rr(90,120)*sc,n=kind?6:5,T=[];
    for(let k=0;k<n;k++){const t=k/n;T.push({yb:b-40*sc-h*.8*t,ww:w*(1-t*.78),th:h*.3})}
    const edge=(Ti,dx)=>{const a=Math.abs(dx),{yb,ww,th}=Ti;return a<ww*.55?yb-th+th*.65*a/(ww*.55):yb-th*.35+th*.35*(a-ww*.55)/(ww*.45)};
    const tier=({yb,ww,th})=>[[cx-ww,yb],[cx-ww*.55,yb-th*.35],[cx,yb-th],[cx+ww*.55,yb-th*.35],[cx+ww,yb],[cx+ww*.62,yb-5*sc],[cx+ww*.3,yb+5*sc],[cx,yb-3*sc],[cx-ww*.3,yb+5*sc],[cx-ww*.62,yb-5*sc]];
    const ci=kind?1+Math.floor(R()*2):-1,sx=ci>=0?cx+sgn()*T[ci].ww*rr(.22,.42):0,sy=ci>=0?edge(T[ci],sx-cx):0;
    add('paper',2,q=>q.poly([[cx-10*sc,b],[cx-6*sc,b-70*sc],[cx+6*sc,b-70*sc],[cx+10*sc,b]],true,.4));
    add('none',1.4,q=>q.line(cx,T[n-1].yb-T[n-1].th+4,cx+rr(-3,3),T[n-1].yb-T[n-1].th-26*sc,.2));
    const tex=Ts=>add('none',1,q=>{for(const{yb,ww,th}of Ts)for(let i=0;i<Math.round(ww/10);i++){const u=rr(-.85,.85),x=cx+u*ww,y=yb-rr(3,th*.45)*(1-Math.abs(u)*.6);ln(q,x,y,x+(u<0?-1:1)*6*sc,y+5*sc)}});
    for(let k=n-1;k>=0;k--){
      if(k===ci)spot(kind,sx,sy,o=>{const s=S(o,44*sc);peekCat(sx,sy+s*.12,s,o)});
      add('paper',1.8,q=>q.poly(tier(T[k]),true,.8));
      if(kind)tex([T[k]]);
    }
    if(!kind)tex(T);
    if(R()<.5)add('paper',1.1,q=>{for(let i=0;i<5;i++){const Ti=T[n-3+Math.floor(R()*3)],x=cx+rr(-.5,.5)*Ti.ww;q.ell(x,Ti.yb-2,3.5*sc,7*sc,.1)}});
  }
  function birch(cx,b,sc,kind){const h=rr(400,470)*sc,lean=rr(-16,16)*sc,tx=cx+lean;
    add('paper',1.8,q=>q.poly([[cx-9*sc,b],[tx-4*sc,b-h],[tx+4*sc,b-h],[cx+9*sc,b]],true,.3));
    add('ink',0,q=>{for(let i=0;i<16;i++){const t=rr(.04,.85),y=b-h*t,x=cx+lean*t,w=(9-5*t)*sc,sd=R()<.5?-1:1,l=rr(.4,.9)*w;q.poly([[x+sd*w,y-1.8*sc],[x+sd*(w-l),y],[x+sd*w,y+2*sc]],true,.2)}});
    add('none',1.3,q=>{for(let i=0;i<5;i++){const t=rr(.5,.85),y=b-h*t,x=cx+lean*t,sd=i%2?1:-1;q.curve([[x,y],[x+sd*30*sc,y-28*sc],[x+sd*rr(50,80)*sc,y-rr(40,70)*sc]],false)}});
    crown(tx,b-h*.8,rr(95,120)*sc,rr(130,160)*sc,sc,kind,.72);
    add('none',1,q=>{for(let i=0;i<7;i++){const x=tx+rr(-80,80)*sc,y=b-h*rr(.62,.72);q.curve([[x,y],[x+3*sc,y+20*sc],[x+1,y+38*sc]],false)}});
  }
  // dub s dutinou; kočka vykukuje z dutiny nebo sedí za kmenem
  function oak(cx,b,sc,kind){const tw=rr(26,34)*sc,th=rr(190,240)*sc,d=sgn(),hx=cx+rr(-.2,.2)*tw,hy=b-th*rr(.42,.55),hrx=tw*.62,hry=tw*.86,sx=cx+d*(tw+15*sc);
    spot('trunk',sx,b,o=>sitCat(sx,b,S(o,48*sc),Object.assign({},o,{dir:d})));
    add('paper',2.4,q=>q.poly([[cx-tw-22*sc,b],[cx-tw,b-24*sc],[cx-tw*.8,b-th],[cx-tw*1.4,b-th-40*sc],[cx+tw*1.3,b-th-44*sc],[cx+tw*.8,b-th],[cx+tw,b-24*sc],[cx+tw+22*sc,b]],true,.8));
    add('none',1,q=>{for(let i=0;i<10;i++){const x=cx+rr(-.8,.8)*tw,y=b-rr(10,th);q.curve([[x,y],[x+rr(-4,4),y-15*sc],[x,y-30*sc]],false)}});
    add('shade',1.8,q=>q.ell(hx,hy,hrx,hry,.08));
    spot('hollow',hx,hy,o=>peekCat(hx,hy+hry*.55,S(o,38*sc),o));
    add('paper',1.6,q=>q.curve([[hx-hrx*1.1,hy+hry*.45],[hx,hy+hry*.72],[hx+hrx*1.1,hy+hry*.45],[hx+hrx*.9,hy+hry*1.25],[hx-hrx*.9,hy+hry*1.25]],true));
    for(const sd of[-1,1]){const pts=[[cx+sd*tw*.6,b-th+10*sc],[cx+sd*70*sc,b-th-30*sc],[cx+sd*110*sc,b-th-50*sc]];
      add('none',12*sc,q=>q.curve(pts,false));add('none',12*sc-4.4,q=>q.curve(pts,false),'paper')}
    crown(cx,b-th-rr(100,130)*sc,rr(175,210)*sc,rr(120,150)*sc,sc,kind);
    if(R()<.5){const nx=cx-d*tw*.2,ny=b-th*.85;add('paper',1.6,q=>{q.rect(nx-14*sc,ny-26*sc,28*sc,30*sc,.3);q.poly([[nx-20*sc,ny-24*sc],[nx,ny-40*sc],[nx+20*sc,ny-24*sc]],true,.3)});add('ink',0,q=>q.ell(nx,ny-10*sc,5*sc,5*sc,.1))}
  }
  // suchý strom s vodorovnou větví, na které leží kočka
  function snag(cx,b,sc){const h=rr(300,370)*sc,tw=16*sc,d0=sgn(),by=b-h*rr(.55,.68),bl=rr(100,130)*sc;
    // větev s kočkou míří na stranu, kde ji nepřekryje koruna stromu vpředu (avoid)
    const clr=sd=>Math.min(1e9,...avoid.filter(([ax])=>(ax-cx)*sd>0).map(([ax,hw])=>Math.abs(ax-cx)-hw));
    const d=cx<300?1:cx>W-300?-1:clr(d0)>=tw+bl+40?d0:clr(-d0)>clr(d0)?-d0:d0,bx=cx+d*(tw+bl*.55),cat=clr(d)>=tw+bl+40;
    add('paper',2.2,q=>q.poly([[cx-tw-12*sc,b],[cx-tw,b-20*sc],[cx-tw*.6,b-h],[cx-tw*.2,b-h-18*sc],[cx+tw*.1,b-h+6*sc],[cx+tw*.5,b-h-12*sc],[cx+tw*.6,b-h],[cx+tw,b-20*sc],[cx+tw+12*sc,b]],true,.5));
    add('none',1,q=>{for(let i=0;i<7;i++){const x=cx+rr(-.6,.6)*tw,y=b-rr(20,h-20);q.line(x,y,x+rr(-2,2),y-rr(20,40)*sc,.4)}});
    const bone=(pts,w)=>{add('none',w,q=>q.curve(pts,false));add('none',Math.max(1,w-4.4),q=>q.curve(pts,false),'paper')};
    bone([[cx-d*tw*.5,b-h*.8],[cx-d*50*sc,b-h*.9],[cx-d*70*sc,b-h*1.02]],9*sc);
    bone([[cx+d*tw*.4,b-h*.35],[cx+d*40*sc,b-h*.42],[cx+d*52*sc,b-h*.52]],7*sc);
    bone([[cx+d*tw*.5,by],[cx+d*(tw+bl*.5),by-4*sc],[cx+d*(tw+bl),by-12*sc]],14*sc);
    add('none',1.4,q=>{const ex=cx+d*(tw+bl),ey=by-12*sc;q.line(ex,ey,ex+d*18*sc,ey-16*sc,.2);q.line(ex,ey,ex+d*20*sc,ey+6*sc,.2)});
    if(cat)spot('branch',bx,by-7*sc,o=>loafCat(bx,by-6*sc,S(o,40*sc),o));
    if(R()<.6)add('ink',0,q=>{const x=cx+tw*.1,y=b-h-8*sc;q.ell(x,y-8*sc,7*sc,6*sc,.1);q.poly([[x+5*sc,y-10*sc],[x+14*sc,y-8*sc],[x+5*sc,y-6*sc]],true,.1);q.ell(x-6*sc,y,10*sc,7*sc,.1)});
  }

  /* lesní okraj a louka */
  function ground(){
    const top=[];for(let x=0;x<W;x+=rr(60,110))top.push([x,FE+rr(-8,16)]);top.push([W,FE]);
    add('paper',2,q=>q.poly(top.concat([[W,H],[0,H]]),true,1));
    add('none',1.1,q=>{for(let i=0;i<260;i++){const x=rr(-10,W+10),y=yOn(top,x)+rr(-2,6),h=rr(6,14);ln(q,x,y,x+rr(-4,4),y-h)}});
  }
  function meadowTex(){
    add('none',1,q=>{for(let i=0;i<680;i++){const y=FE+15+Math.pow(R(),1.25)*(H-FE-15),x=R()*W,k=pk(y),h=rr(5,11)*k*1.3;
      ln(q,x,y,x-3*k,y-h);ln(q,x,y,x+k,y-h*1.2);ln(q,x,y,x+4*k,y-h)}});
    add('paper',1,q=>{for(let i=0;i<50;i++){const y=rr(FE+40,H-10),x=rr(0,W),r=3*pk(y);for(let k=0;k<4;k++){const a=k/4*6.283;dot(q,x+Math.cos(a)*r*1.3,y+Math.sin(a)*r*1.3,r,r)}}});
  }
  // kapradí: většina listů za kočkou, dva přes ni
  function fern(x,y){const s=pk(y),fr=[];for(let i=0;i<Math.round(rr(6,9));i++)fr.push([-Math.PI/2+rr(-1.25,1.25),rr(55,90)*s]);
    fr.sort((a,b)=>Math.abs(b[0]+Math.PI/2)-Math.abs(a[0]+Math.PI/2));
    const frond=F=>add('none',1.2,q=>{for(const[a,l]of F){const ex=x+Math.cos(a)*l,ey=y+Math.sin(a)*l*.85,mx=x+Math.cos(a)*l*.5,my=y+Math.sin(a)*l*.55-12*s;q.curve([[x,y],[mx,my],[ex,ey]],false);
      for(let k=1;k<8;k++){const t=k/8,px=(1-t)*(1-t)*x+2*t*(1-t)*mx+t*t*ex,py=(1-t)*(1-t)*y+2*t*(1-t)*my+t*t*ey,ll=((1-t)*14+4)*s;
        ln(q,px,py,px+Math.cos(a-1.1)*ll,py+Math.sin(a-1.1)*ll);ln(q,px,py,px+Math.cos(a+1.1)*ll,py+Math.sin(a+1.1)*ll)}}});
    frond(fr.slice(2));
    spot('fern',x,y-30*s,o=>peekCat(x+o.dir*4,y-24*s,S(o,44*s),o));
    frond(fr.slice(0,2));
  }
  // kámen: balvan s mechem, dvojice nebo plochý kámen; kočka na něm leží nebo za ním vykukuje
  function rock(x,y){const s=pk(y),v=R(),w=rr(90,130)*s,h=w*(v<.35?.3:rr(.5,.65)),d=sgn();
    if(v>=.35&&v<.7){const px=x+d*w*.2;spot('stone',px,y-h,o=>peekCat(px,y-h+4*s,S(o,46*s),o))}
    add('paper',2.2,q=>q.curve([[x-w/2,y],[x-w*.48,y-h*.6],[x-w*.25,y-h],[x+w*.2,y-h*.96],[x+w*.46,y-h*.55],[x+w/2,y]],true));
    add('none',1,q=>{q.curve([[x-w*.2,y-h*.7],[x,y-h*.8],[x+w*.18,y-h*.66]],false);q.line(x+w*.22,y-h*.35,x+w*.3,y-h*.2,.2)});
    if(v>=.7)add('shade',0,q=>q.curve([[x-w*.4,y-h*.55],[x-w*.2,y-h*.92],[x+w*.05,y-h*.9],[x-w*.1,y-h*.6]],true));
    if(v>=.35&&v<.7)add('paper',2,q=>q.curve([[x-d*w*.3-24*s,y+2],[x-d*w*.3-20*s,y-26*s],[x-d*w*.3+10*s,y-30*s],[x-d*w*.3+28*s,y+2]],true));
    const tx=x+rr(-.15,.15)*w;
    if(v<.35||v>=.7)spot('stone',tx,y-h,o=>loafCat(tx,y-h*.92,S(o,44*s),o));
    add('none',1.1,q=>{for(let i=0;i<7;i++){const bx=x+rr(-.55,.55)*w;ln(q,bx,y+2,bx+rr(-5,5)*s,y-rr(8,16)*s)}});
  }
  function stump(x,y){const s=pk(y),w=rr(52,80)*s,h=rr(34,58)*s,v=R(),d=sgn();
    spot('stump',x,y-h,o=>peekCat(x+o.dir*6*s,y-h+1*s,S(o,48*s),o));
    add('paper',2.2,q=>q.poly([[x-w/2-12*s,y+2],[x-w/2,y-8*s],[x-w/2+3*s,y-h],[x+w/2-3*s,y-h],[x+w/2,y-8*s],[x+w/2+12*s,y+2]],true,.6));
    add('paper',2,q=>q.ell(x,y-h,w/2-3*s,8*s,.05));
    add('none',1,q=>{q.ell(x,y-h,w/5,3.5*s,.1);q.ell(x,y-h,w/3,5.5*s,.1);q.line(x-w*.18,y-h*.75,x-w*.16,y-h*.2,.3);q.line(x+w*.15,y-h*.6,x+w*.17,y-h*.15,.3)});
    if(v<.3){add('none',2.6,q=>q.line(x+d*w*.42,y-h-2,x+d*(w*.42+44*s),y-h-50*s,.2));add('paper',1.6,q=>q.poly([[x+d*w*.3,y-h-2],[x+d*w*.52,y-h-2],[x+d*w*.48,y-h-16*s],[x+d*w*.32,y-h-14*s]],true,.2))}
    else if(v<.55)add('paper',1.4,q=>{for(let k=0;k<3;k++){const mx=x+d*(w/2+2*s-k*9*s),my=y-h*(.3+k*.18);q.poly([[mx,my],[mx+d*14*s,my-2*s],[mx+d*10*s,my+4*s]],true,.2)}});
    else if(v<.75)add('shade',0,q=>q.ell(x-d*w*.25,y-h*.35,w*.2,h*.3,.1));
  }
  function logp(x,y){const s=pk(y),w=rr(170,250)*s,hol=R()<.4,r=(hol?rr(30,35):rr(20,28))*s,d=sgn(),ex=x+d*w/2,lx=x+rr(-.2,.2)*w,tx=x-d*rr(0,.3)*w;
    if(!hol)spot('log',lx,y-r*2,o=>{const s2=S(o,50*s);peekCat(lx,y-r*2+s2*.16,s2,o)});
    add('paper',2.2,q=>q.poly([[x-w/2,y],[x+w/2,y],[x+w/2,y-r*2],[x-w/2,y-r*2]],true,.8));
    add('paper',2,q=>q.ell(ex,y-r,r*.55,r,.06));
    add('none',1,q=>{for(let i=0;i<5;i++){const yy=y-rr(.3,1.7)*r,xx=x+rr(-.45,.3)*w;q.line(xx,yy,xx+rr(30,60)*s,yy,.3)}
      q.line(x-w/2+20*s,y-r*2,x-w/2+10*s,y-r*2-22*s,.2)});
    if(hol){add('shade',1.2,q=>q.ell(ex,y-r,r*.42,r*.78,.06));spot('loghole',ex,y-r,o=>peekCat(ex,y-r*.35,S(o,38*s),o))}
    else add('none',1,q=>q.ell(ex,y-r,r*.25,r*.45,.1));
    if(R()<.5)add('paper',1.2,q=>{for(let k=0;k<5;k++)q.ell(x+rr(-.4,.3)*w,y-r*2+2*s,9*s,4*s,.1)});
    spot('logtop',tx,y-r*2,o=>o.alt?loafCat(tx,y-r*2+3*s,S(o,46*s),o):sleepCat(tx,y-r*2+3*s,S(o,50*s),o));
  }
  // stoh / balík / kupka sena
  function hay(x,y){const s=pk(y),t=R(),d=sgn();
    // stoh: kočka sedí u boku, obličejem ven (za stohem je jen ocas a kus zad)
    if(t<.4){const w=rr(130,160)*s,h=rr(140,170)*s,hx=x+d*w*.56;
      spot('hay',hx,y-2,o=>sitCat(hx,y-2,S(o,44*s),Object.assign({},o,{dir:d})));
      add('paper',2.2,q=>q.curve([[x-w/2,y],[x-w*.5,y-h*.45],[x-w*.22,y-h*.88],[x,y-h],[x+w*.22,y-h*.88],[x+w*.5,y-h*.45],[x+w/2,y]],true));
      add('none',2.4,q=>q.line(x,y-h+6*s,x+rr(-4,4)*s,y-h-36*s,.2));
      add('none',1,q=>{for(let i=0;i<22;i++){const px=x+rr(-.4,.4)*w,py=y-rr(.08,.85)*h;q.line(px,py,px+rr(-8,8)*s,py+rr(10,22)*s,.3)}
        q.curve([[x-w*.46,y-h*.3],[x,y-h*.36],[x+w*.46,y-h*.3]],false)})}
    else if(t<.7){const w=rr(110,130)*s,r=rr(44,52)*s,cx=x+d*w/2,tx=x+rr(-.2,.2)*w;
      add('paper',2.2,q=>q.poly([[x-w/2,y],[x+w/2,y],[x+w/2,y-r*2],[x-w/2,y-r*2]],true,.6));
      add('none',1,q=>{for(let i=0;i<14;i++){const px=x+rr(-.45,.45)*w,py=y-rr(.1,1.9)*r;q.line(px,py,px+rr(-10,10)*s,py+rr(-3,3)*s,.3)}});
      add('paper',2.2,q=>q.ell(cx,y-r,r*.5,r,.05));
      add('none',1,q=>q.curve([[cx,y-r],[cx+r*.12,y-r*1.2],[cx-r*.25,y-r*1.3],[cx-r*.3,y-r*.8],[cx+r*.1,y-r*.4],[cx+r*.35,y-r*.9],[cx+r*.3,y-r*1.6]],false));
      spot('hay',tx,y-r*2,o=>loafCat(tx,y-r*2+4*s,S(o,46*s),o))}
    else{const w=rr(130,180)*s,h=w*rr(.55,.7),hx=x+rr(-.15,.15)*w;
      add('paper',2.2,q=>q.curve([[x-w/2,y],[x-w*.52,y-h*.55],[x-w*.25,y-h],[x+w*.2,y-h*1.02],[x+w*.5,y-h*.5],[x+w/2,y]],true));
      add('none',1,q=>{for(let i=0;i<16;i++){const px=x+rr(-.4,.4)*w,py=y-rr(.1,.85)*h;q.line(px,py,px+rr(-10,10)*s,py+rr(10,22)*s,.3)}});
      add('none',2,q=>{q.line(x+w*.3,y+2,x+w*.62,y-h*1.2,.2);for(let k=-1;k<=1;k++)q.line(x+w*.62,y-h*1.2,x+w*.62+k*6*s,y-h*1.2-22*s,.1)});
      spot('hay',hx,y-h,o=>sleepCat(hx,y-h*.92,S(o,50*s),o))}
  }
  // kočka vykukující z lesa na jeho okraji
  function peekForest(x,y){spot('forest',x,y,o=>peekCat(x,y,S(o,36),o));add('none',1.1,q=>{for(let i=0;i<9;i++){const bx=x+rr(-22,22);ln(q,bx,y+4,bx+rr(-4,4),y-rr(6,13))}})}
  function shadow(x,y,w){const k=pk(y);add('shade',0,q=>blob(q,x+w*.08,y+2*k,w/2,9*k,9,.05))}
  function molehill(x,y){const s=pk(y);add('paper',1.8,q=>q.curve([[x-26*s,y],[x-12*s,y-18*s],[x+10*s,y-20*s],[x+28*s,y]],false));add('ink',0,q=>{for(let i=0;i<4;i++)q.ell(x+rr(-16,16)*s,y-rr(3,12)*s,1.6,1.6,.2)})}
  function anthill(x,y){const s=pk(y),w=rr(70,90)*s,h=w*.55;
    add('paper',2,q=>q.curve([[x-w/2,y],[x-w*.25,y-h*.8],[x,y-h],[x+w*.25,y-h*.8],[x+w/2,y]],true));
    add('shade',0,q=>q.curve([[x+w*.05,y-h*.2],[x+w*.2,y-h*.7],[x+w*.42,y-h*.1]],true));
    add('ink',0,q=>{for(let i=0;i<16;i++)q.ell(x+rr(-.4,.4)*w,y-rr(.05,.8)*h,1.4,1.4,.2)});
  }
  function picnic(x,y){const s=pk(y),bw=rr(150,200)*s,kx=x+rr(-.2,.2)*bw,ky=y-18*s,kw=56*s,kh=36*s,ix=x-Math.sign(kx-x||1)*bw*.28;
    add('paper',1.6,q=>q.poly([[x-bw/2,y],[x+bw/2,y],[x+bw/2-26*s,y-50*s],[x-bw/2+26*s,y-50*s]],true,.5));
    add('none',1,q=>{for(let k=1;k<5;k++){const t=k/5;q.line(x-bw/2+bw*t,y,x-bw/2+26*s+(bw-52*s)*t,y-50*s,.3)}q.line(x-bw/2+13*s,y-25*s,x+bw/2-13*s,y-25*s,.3)});
    add('paper',1.4,q=>{q.ell(ix,y-20*s,16*s,6*s,.05);q.ell(ix-2*s,y-26*s,6*s,6*s,.1);q.rect(ix+14*s,y-44*s,8*s,26*s,.2)});
    const bx=kx-Math.sign(kx-x||1)*(kw/2+30*s),by=y-22*s;spot('blanket',bx,by,o=>sleepCat(bx,by,S(o,44*s),o));
    add('shade',1.8,q=>q.ell(kx,ky-kh,kw/2,7*s,.05));
    spot('basket',kx,ky-kh,o=>{const s2=S(o,44*s);peekCat(kx,ky-kh+s2*.16,s2,o)});
    add('paper',2,q=>q.poly([[kx-kw/2,ky-kh],[kx+kw/2,ky-kh],[kx+kw/2-6*s,ky],[kx-kw/2+6*s,ky]],true,.5));
    add('none',1,q=>{for(let k=-2;k<=2;k++)q.line(kx+k*9*s,ky-kh+3,kx+k*8*s,ky-3,.2);q.line(kx-kw/2+3,ky-kh*.5,kx+kw/2-3,ky-kh*.5,.2)});
    add('none',2,q=>q.curve([[kx-kw/2+4*s,ky-kh],[kx,ky-kh-34*s],[kx+kw/2-4*s,ky-kh]],false));
  }
  // krmelec: stříška, žebřiny se senem a korýtko
  function feeder(x,y){const s=pk(y),w=150*s,h=150*s,dp=46*s,rt=y-h*.85,rb=y-h*.35,sx=x+rr(-.2,.2)*w,tx=x+rr(-.15,.15)*w;
    add('none',2.6,q=>{q.line(x-w/2+dp,y-dp*.4,x-w/2+dp,y-h-dp*.4,.3);q.line(x+w/2+dp,y-dp*.4,x+w/2+dp,y-h-dp*.4,.3)});
    add('paper',1.8,q=>q.poly([[x-w*.42,rt],[x+w*.42,rt],[x+w*.12,rb],[x-w*.12,rb]],true,.4));
    add('paper',1.4,q=>q.curve([[x-w*.42,rt+3],[x-w*.3,rt-14*s],[x-w*.1,rt-8*s],[x+w*.1,rt-16*s],[x+w*.3,rt-10*s],[x+w*.42,rt+3]],true));
    spot('feeder',sx,rt,o=>{const s2=S(o,42*s);peekCat(sx,rt+s2*.18,s2,o)});
    add('none',1.8,q=>{for(let k=-4;k<=4;k++)q.line(x+k*w*.1,rt,x+k*w*.03,rb,.2);q.line(x-w*.44,rt,x+w*.44,rt,.2);q.line(x-w*.13,rb,x+w*.13,rb,.2)});
    add('none',1,q=>{for(let i=0;i<8;i++){const px=x+rr(-.3,.3)*w;q.line(px,rt+2,px+rr(-6,6),rt+rr(8,16)*s,.2)}});
    add('shade',1.4,q=>q.rect(x-w*.4,y-44*s,w*.8,8*s,.2));
    spot('trough',tx,y-40*s,o=>sleepCat(tx,y-35*s,S(o,40*s),o));
    add('paper',2,q=>q.rect(x-w*.42,y-38*s,w*.84,22*s,.4));
    add('none',2,q=>{q.line(x-w*.36,y-16*s,x-w*.38,y,.2);q.line(x+w*.36,y-16*s,x+w*.38,y,.2)});
    add('none',2.8,q=>{q.line(x-w/2,y,x-w/2,y-h,.3);q.line(x+w/2,y,x+w/2,y-h,.3)});
    add('paper',2,q=>q.poly([[x,y-h-60*s],[x+w/2+22*s,y-h],[x+w/2+22*s+dp,y-h-dp*.4],[x+dp,y-h-60*s-dp*.4]],true,.4));
    add('paper',2.2,q=>q.poly([[x-w/2-22*s,y-h],[x,y-h-60*s],[x+w/2+22*s,y-h]],true,.4));
    add('none',1,q=>{for(let k=1;k<4;k++){const t=k/4;q.line(x-(w/2+22*s)*t,y-h-60*s*(1-t),x+(w/2+22*s)*t,y-h-60*s*(1-t),.2)}});
    add('paper',1.2,q=>q.rect(x+w/2+4*s,y-26*s,22*s,14*s,.2));
  }
  function woodpile(x,y){const s=pk(y),r=rr(11,14)*s,cols=Math.round(rr(6,9)),rows=Math.round(rr(3,5)),w=cols*r*2,top=y-rows*r*1.75-r,roof=R()<.45,tx=x+rr(-.25,.25)*w,d=sgn();
    add('none',2.6,q=>{q.line(x-w/2-r-4,y,x-w/2-r-6,top-8*s,.2);q.line(x+w/2+r*.2+4,y,x+w/2+r*.2+6,top-8*s,.2)});
    const L=[];for(let j=0;j<rows;j++)for(let i=0;i<cols-(j%2);i++)L.push([x-w/2+r*(j%2)+i*r*2,y-r-j*r*1.75,r*rr(.88,1.05)]);
    add('paper',1.4,q=>{for(const[a,b,c]of L)blob(q,a,b,c*1.05,c,8,.06)});
    add('none',.9,q=>{for(const[a,b,c]of L){blob(q,a,b,c*.4,c*.38,6);if(R()<.4)q.line(a,b,a+c*.7,b-c*.4,.1)}});
    let ct=top;
    if(roof){ct=top-14*s;add('paper',1.8,q=>q.poly([[x-w/2-r-16*s,top+2*s],[x+w/2+16*s,top-6*s],[x+w/2+16*s,top-16*s],[x-w/2-r-16*s,top-8*s]],true,.3))}
    spot('woodpile',tx,ct,o=>loafCat(tx,ct+3*s,S(o,42*s),o));
    if(R()<.6){const bx=x+d*(w/2+60*s);add('paper',1.8,q=>{q.rect(bx-20*s,y-30*s,40*s,30*s,.4);q.ell(bx,y-30*s,20*s,5*s,.05)});
      add('none',2.2,q=>q.line(bx-4*s,y-32*s,bx-30*s*d,y-80*s,.2));add('paper',1.4,q=>q.poly([[bx-8*s,y-32*s],[bx+6*s,y-32*s],[bx+4*s,y-46*s],[bx-6*s,y-44*s]],true,.2))}
  }
  // seník: štít k divákovi, bok ubíhá dozadu, vrata a půdní otvor se senem
  function barn(x0c,y){const s=pk(y),w=rr(230,280)*s,h=rr(145,170)*s,gh=w*rr(.42,.52),dep=rr(170,230)*s,sd=sgn(),logs=R()<.5,thatch=R()<.4;
    const x=x0c-sd*dep/2,x0=x-w/2,x1=x+w/2,wt=y-h,ap=wt-gh,ex=sd>0?x1:x0,dx=sd*dep,dy=-dep*.33;
    add('paper',2,q=>q.poly([[ex,y],[ex+dx,y+dy],[ex+dx,wt+dy],[ex,wt]],true,.5));
    add('none',1,q=>{if(logs)for(let k=1;k<9;k++){const t=k/9;q.line(ex,y-h*t,ex+dx,y+dy-h*t,.3)}else for(let k=1;k<10;k++){const t=k/10;q.line(ex+dx*t,y+dy*t,ex+dx*t,wt+dy*t,.3)}});
    const wx=ex+dx*.55,wy=wt+dy*.55+h*.3;add('shade',1.4,q=>q.poly([[wx-18*s,wy],[wx+18*s,wy+sd*6*s*-1],[wx+18*s,wy-28*s-sd*6*s],[wx-18*s,wy-28*s]],true,.2));
    const e2=ex+sd*16*s,rp=[[x,ap-8*s],[e2,wt+8*s],[e2+dx,wt+8*s+dy],[x+dx,ap-8*s+dy]];
    add('paper',2.2,q=>q.poly(rp,true,.5));
    add('none',1,q=>{const n=thatch?40:7;for(let k=1;k<n;k++){const t=k/n,ax=x+(e2-x)*t,ay=ap-8*s+(wt+16*s-ap)*t;
      if(thatch){for(let j=0;j<5;j++){const u=rr(0,1);q.line(ax+dx*u,ay+dy*u,ax+dx*u+sd*4*s,ay+dy*u+10*s,.2)}}else q.line(ax,ay,ax+dx,ay+dy,.3)}});
    const rt=rr(.35,.7),rx=x+dx*rt,ry=ap-8*s+dy*rt;
    spot('roof',rx,ry,o=>loafCat(rx,ry+5*s,S(o,40*s),o));
    add('paper',2.2,q=>q.poly([[x0,y],[x1,y],[x1,wt],[x,ap],[x0,wt]],true,.5));
    add('none',1,q=>{if(logs){for(let yy=y-h/9;yy>ap+8;yy-=h/9){const hw=yy>wt?w/2:w/2*(yy-ap)/(wt-ap);q.line(x-hw,yy,x+hw,yy,.3)}
        for(let yy=y-h/18;yy>wt;yy-=h/9)for(const c of[x0,x1])q.ell(c,yy,6*s,h/20,.1)}
      else for(let c=x0+w/12;c<x1-4;c+=w/12){const ty=Math.abs(c-x)>w/2?wt:wt-gh*(1-Math.abs(c-x)/(w/2));q.line(c,y,c,ty+4,.3)}});
    add('none',2.6,q=>{q.line(x0-18*s,wt+12*s,x,ap-10*s,.4);q.line(x,ap-10*s,x1+18*s,wt+12*s,.4)});
    const dw=w*rr(.4,.48),dh=h*rr(.72,.8),dc=x+rr(-.1,.1)*w,cx=dc+rr(-.2,.2)*dw;
    add('shade',1.8,q=>q.rect(dc-dw/2,y-dh,dw,dh,.4));
    add('paper',1.2,q=>q.curve([[dc-dw/2+2,y],[dc-dw*.3,y-dh*.3],[dc+dw*.05,y-dh*.24],[dc+dw*.3,y-dh*.38],[dc+dw/2-2,y]],true));
    spot('barndoor',cx,y-2,o=>sitCat(cx,y-2,S(o,44*s),o));
    for(const ls of[-1,1]){const e=dc+ls*dw/2,o2=ls*dw*.4;add('paper',2,q=>q.poly([[e,y],[e+o2,y+10*s],[e+o2,y-dh+10*s],[e,y-dh]],true,.4));
      add('none',1.2,q=>{q.line(e,y-dh*.15,e+o2,y-dh*.15+10*s,.2);q.line(e,y-dh*.85,e+o2,y-dh*.85+10*s,.2);q.line(e,y-dh*.15,e+o2,y-dh*.85+10*s,.2)})}
    const lw2=w*.26,lh=gh*.5,ly=wt-2*s,lx=x+rr(-.15,.15)*lw2;
    add('shade',1.6,q=>q.rect(x-lw2/2,ly-lh,lw2,lh,.3));
    add('paper',1.2,q=>q.curve([[x-lw2/2+2,ly],[x-lw2*.3,ly-lh*.3],[x,ly-lh*.22],[x+lw2*.3,ly-lh*.35],[x+lw2/2-2,ly]],true));
    spot('loft',lx,ly,o=>peekCat(lx,ly+3*s,S(o,40*s),o));
    add('paper',1.6,q=>q.rect(x-lw2/2-8*s,ly-2*s,lw2+16*s,9*s,.3));
    add('none',1,q=>{for(let i=0;i<8;i++){const px=x+rr(-.5,.5)*lw2;q.line(px,ly+6*s,px+rr(-6,6)*s,ly+rr(14,24)*s,.2)}});
    add('none',1.6,q=>q.curve([[dc-10*s,y-dh-10*s],[dc-12*s,y-dh-24*s],[dc,y-dh-30*s],[dc+12*s,y-dh-24*s],[dc+10*s,y-dh-10*s]],false));
    const fx=ex-sd*14*s;add('none',2,q=>{q.line(fx,y,fx+sd*6*s,y-h*.8,.2);for(let k=-1;k<=1;k++)q.line(fx+sd*6*s+k*5*s,y-h*.8,fx+sd*6*s+k*6*s,y-h*.8-20*s,.1)});
  }
  function sheep(x,y,s,d,v,dark){const lie=v>.8,by=lie?y-20*s:y-36*s;
    if(!lie)add('none',2.4,q=>{for(const a of[-24,-12,14,26])q.line(x+d*a*s,by+10*s,x+d*a*s+rr(-2,2),y,.2)});
    add(dark?'ink':'paper',2,q=>{const p=[];for(let i=0;i<16;i++){const a=i/16*6.283,k=i%2?1.13:.98;p.push([x+Math.cos(a)*40*s*k,by+Math.sin(a)*24*s*k])}q.curve(p,true)});
    add('none',1,q=>{for(let i=0;i<7;i++){const cx=x+rr(-28,28)*s,cy=by+rr(-14,12)*s;q.curve([[cx-5*s,cy],[cx,cy-5*s],[cx+5*s,cy]],false)}},dark?'paper':'ink');
    const hx=x+d*40*s,hy=v<.4?y-16*s:by-18*s;
    add('ink',1.4,q=>{q.ell(hx,hy,11*s,15*s,.05,d*(v<.4?.6:-.4));q.ell(hx-d*9*s,hy-10*s,8*s,4*s,.1,d*.4)});
    add('paper',0,q=>q.ell(hx+d*3*s,hy-5*s,2.2*s,2.2*s,.1));
  }
  // ohrada s ovcemi: kočky mezi ovcemi a na plotě
  function pasture(x,y){const s=pk(y),D=rr(150,185)*s,w=rr(480,580)*s,bw=w*.9,sb=pk(y-D),ph=58*s;
    const post=(px,py,ss)=>q=>q.rect(px-5*ss,py-ph*ss/s,10*ss,ph*ss/s,.2);
    const fence=(ax,ay,bx,by,sa,sb2,n)=>{const P=[];for(let k=0;k<=n;k++){const t=k/n;P.push([ax+(bx-ax)*t,ay+(by-ay)*t,sa+(sb2-sa)*t])}
      add('paper',1.4,q=>{for(const f of[.72,.36])q.poly([[ax,ay-ph*sa/s*f],[bx,by-ph*sb2/s*f],[bx,by-ph*sb2/s*f+6*sb2],[ax,ay-ph*sa/s*f+6*sa]],true,.3)});
      add('paper',1.8,q=>{for(const[px,py,ss]of P)post(px,py,ss)(q)});return P};
    fence(x-bw/2,y-D,x+bw/2,y-D,sb,sb,Math.round(bw/90));
    fence(x-bw/2,y-D,x-w/2,y,sb,s,2);fence(x+bw/2,y-D,x+w/2,y,sb,s,2);
    const n=3+Math.floor(R()*3),Sh=[];for(let i=0;i<n;i++){const sy=y-D+rr(40,D-16);Sh.push({x:x+(i+.5-n/2)*w/n*.9+rr(-20,20)*s,y:sy,s:pk(sy)*.95,d:sgn(),v:R(),dark:R()<.15})}
    Sh.sort((a,b)=>a.y-b.y);
    // kočka leží ovci na hřbetě, hlavou od hlavy ovce; ovce vzadu (daleko od předního plotu) a vždy bílá
    const back=Sh.map((e,i)=>i).filter(i=>Sh[i].y<y-70*s),ci=back.length?back[Math.floor(R()*back.length)]:0,cd=sgn();
    Sh[ci].dark=false;
    {const tx=x+rr(-.3,.2)*w,ty=y-D+30*s;add('none',2,q=>{q.line(tx+6*sb,ty,tx+4*sb,ty+12*sb,.1);q.line(tx+74*sb,ty,tx+76*sb,ty+12*sb,.1)});add('shade',1.4,q=>q.poly([[tx,ty-14*sb],[tx+80*sb,ty-14*sb],[tx+74*sb,ty],[tx+6*sb,ty]],true,.2))}
    for(const e of Sh)sheep(e.x,e.y,e.s,e.d,e.v,e.dark);
    {const e=Sh[ci],ss=e.s,cx=e.x+e.d*(cd>0?4:10)*ss,cy=(e.v>.8?e.y-20*ss:e.y-36*ss)-17*ss,od=-e.d;
      spot('sheep',cx,cy,o=>o.alt?loafCat(cx,cy,S(o,36*ss),Object.assign({},o,{dir:od})):sleepCat(cx,cy+2*ss,S(o,40*ss),Object.assign({},o,{dir:od})))}
    const P=fence(x-w/2,y,x+w/2,y,s,s,Math.round(w/95));
    const k1=1+Math.floor(R()*(P.length-2)),[fx,fy]=P[k1],rx=x+rr(-.35,.35)*w,ry=y-ph*.72;
    spot('fence',fx,fy-ph,o=>sitCat(fx,fy-ph+2*s,S(o,36*s),o));
    spot('fence',rx,ry,o=>loafCat(rx,ry+2*s,S(o,38*s),o));
  }
  // úly na lavici: kočka vykukuje zpoza jednoho z nich
  function hives(x,y){const s=pk(y),n=2+Math.floor(R()*3),gap=84*s,x0=x-(n-1)*gap/2,st=y-30*s,Hv=[];
    for(let i=0;i<n;i++){const t=R();Hv.push({t:t<.4?0:t<.7?1:2,hx:x0+i*gap,nb:2+Math.floor(R()*2)})}
    const top=h=>h.t===0?st-h.nb*26*s-12*s:h.t===1?st-64*s:st-78*s;
    const ci=Math.floor(R()*n),cx=Hv[ci].hx+sgn()*20*s,ct=top(Hv[ci]);
    add('none',2.6,q=>{for(const e of[x0-40*s,x0+(n-1)*gap+40*s])q.line(e,st+4*s,e+(e<x?-4:4)*s,y,.3)});
    add('paper',2,q=>q.rect(x0-50*s,st,(n-1)*gap+100*s,9*s,.4));
    for(let i=0;i<n;i++){const{t,hx,nb}=Hv[i];
      if(i===ci)spot('hive',cx,ct,o=>{const s2=S(o,40*s);peekCat(cx,ct+s2*.2,s2,o)});
      if(t===0){add('paper',2,q=>{for(let j=0;j<nb;j++)q.rect(hx-28*s,st-(j+1)*26*s,56*s,26*s,.3)});
        add('paper',2,q=>q.rect(hx-32*s,st-nb*26*s-12*s,64*s,12*s,.3));
        add('ink',0,q=>q.rect(hx-12*s,st-6*s,24*s,4*s,.1))}
      else if(t===1){add('paper',2,q=>q.curve([[hx-30*s,st],[hx-33*s,st-30*s],[hx-20*s,st-56*s],[hx,st-64*s],[hx+20*s,st-56*s],[hx+33*s,st-30*s],[hx+30*s,st]],true));
        add('none',1,q=>{for(let k=1;k<6;k++){const yy=st-k*11*s,hw=30*s*Math.sqrt(1-Math.pow(k/6,2))+2;q.curve([[hx-hw,yy],[hx,yy+3*s],[hx+hw,yy]],false)}});
        add('ink',0,q=>q.ell(hx,st-5*s,6*s,4*s,.1))}
      else{add('paper',2,q=>q.rect(hx-26*s,st-58*s,52*s,58*s,.3));
        add('paper',2,q=>q.poly([[hx-34*s,st-54*s],[hx,st-78*s],[hx+34*s,st-54*s]],true,.3));
        add('none',1,q=>{q.rect(hx-9*s,st-40*s,18*s,22*s,.2);q.line(hx-26*s,st-14*s,hx+26*s,st-14*s,.2)});add('ink',0,q=>q.rect(hx-8*s,st-6*s,16*s,3*s,.1))}
    }
    add('none',.9,q=>{for(let i=0;i<9;i++){const bx=x+rr(-.6,.6)*n*gap,by=st-rr(20,110)*s;q.curve([[bx,by],[bx+5,by-5],[bx+10,by],[bx+5,by+5],[bx,by],[bx-5,by-5],[bx-10,by]],false)}});
    add('ink',0,q=>{for(let i=0;i<12;i++)q.ell(x+rr(-.6,.6)*n*gap,st-rr(10,120)*s,2,1.6,.2)});
  }
  function signpost(x,y){const s=pk(y),h=210*s,d=sgn(),A=[];for(let i=0;i<2+Math.floor(R()*2);i++)A.push({dir:sgn(),yy:y-h+34*s+i*26*s,l:rr(80,110)*s});
    const sx=x+d*16*s;spot('sign',sx,y,o=>sitCat(sx,y,S(o,44*s),o));
    add('paper',2,q=>q.rect(x-6*s,y-h,12*s,h,.3));
    add('paper',1.8,q=>q.poly([[x-16*s,y-h+2],[x,y-h-16*s],[x+16*s,y-h+2]],true,.2));
    for(const a of A){const ax=a.dir>0?x-8*s:x+8*s,bx=ax+a.dir*a.l;
      add('paper',1.8,q=>q.poly([[ax,a.yy-10*s],[bx,a.yy-10*s],[bx+a.dir*12*s,a.yy],[bx,a.yy+10*s],[ax,a.yy+10*s]],true,.3));
      add('none',1,q=>{q.line(ax+a.dir*12*s,a.yy-2*s,ax+a.dir*a.l*.7,a.yy-2*s,.2);q.line(ax+a.dir*12*s,a.yy+4*s,ax+a.dir*a.l*.45,a.yy+4*s,.2)})}
    add('paper',1.2,q=>q.rect(x-8*s,y-h*.4,16*s,16*s,.1));add('shade',0,q=>q.rect(x-8*s,y-h*.4+5*s,16*s,6*s,.1));
    add('none',1.2,q=>{for(let i=0;i<9;i++){const bx=x+rr(-20,20)*s;q.line(bx,y+2,bx+rr(-8,8)*s,y-rr(14,26)*s,.2)}});
  }
  // žebřiňák se senem: kočka spí nahoře v seně nebo leží ve stínu pod vozem
  function wagon(x,y){const s=pk(y),w=rr(240,280)*s,d=sgn(),bt=y-66*s,hh=rr(60,85)*s,r=32*s,ux=x+rr(-.12,.12)*w*.3,tx=x+rr(-.25,.25)*w,ud=ux<x?1:-1;
    add('shade',0,q=>blob(q,x,y-6*s,w*.42,12*s,9,.05));
    // pod vozem mezi koly, hlavou ke středu (ať ji nezakryje kolo)
    spot('underwagon',ux,y-4*s,o=>loafCat(ux-ud*8*s,y-4*s,S(o,40*s),Object.assign({},o,{dir:ud})));
    add('none',3,q=>{q.line(x+d*w/2,bt+6*s,x+d*(w/2+110*s),y-10*s,.3);q.line(x+d*w/2,bt+14*s,x+d*(w/2+104*s),y-4*s,.3)});
    add('paper',1.6,q=>q.curve([[x-w*.5,bt-26*s],[x-w*.42,bt-26*s-hh*.8],[x-w*.1,bt-26*s-hh],[x+w*.25,bt-26*s-hh*.95],[x+w*.48,bt-26*s-hh*.6],[x+w*.52,bt-20*s]],true));
    add('none',1,q=>{for(let i=0;i<18;i++){const px=x+rr(-.45,.45)*w,py=bt-26*s-rr(.1,.8)*hh;ln(q,px,py,px+rr(-10,10)*s,py+rr(8,18)*s)}});
    spot('wagon',tx,bt-26*s-hh*.9,o=>sleepCat(tx,bt-26*s-hh*.82,S(o,48*s),o));
    add('paper',2,q=>q.rect(x-w/2,bt-8*s,w,16*s,.4));
    add('none',1.8,q=>{q.line(x-w/2,bt-34*s,x+w/2,bt-34*s,.3);for(let k=0;k<=10;k++){const xx=x-w/2+w*k/10;q.line(xx,bt-8*s,xx+4*s,bt-36*s,.2)}});
    for(const e of[-1,1]){const wx=x+e*w*.32;add('paper',2.2,q=>q.ell(wx,y-r,r,r,.04));
      add('none',1.2,q=>{q.ell(wx,y-r,r*.22,r*.22,.1);for(let k=0;k<6;k++){const a=k/6*6.283;q.line(wx+Math.cos(a)*r*.22,y-r+Math.sin(a)*r*.22,wx+Math.cos(a)*r*.9,y-r+Math.sin(a)*r*.9,.1)}})}
    add('none',2.2,q=>q.line(x-d*w*.2,bt-40*s,x-d*w*.45,bt-120*s,.2));
  }
  function barrow(x,y){const s=pk(y),d=sgn(),w=100*s,c=R();
    add('none',2.4,q=>{q.line(x-d*w*.3,y-30*s,x-d*w*.35,y,.2);q.line(x-d*w*.4,y-40*s,x-d*w*1.05,y-58*s,.2);q.line(x+d*w*.2,y-34*s,x+d*w*.55,y-18*s,.2)});
    add('shade',1.2,q=>q.ell(x,y-60*s,w*.5,10*s,.05));
    if(c<.35)add('paper',1.6,q=>{for(let k=-1;k<=1;k++)q.ell(x+k*24*s,y-66*s,15*s,12*s,.08)});
    else if(c<.7)add('paper',1.4,q=>q.curve([[x-w*.45,y-60*s],[x-w*.3,y-78*s],[x,y-74*s],[x+w*.3,y-80*s],[x+w*.45,y-60*s]],true));
    else add('paper',1.4,q=>{for(let k=0;k<4;k++)q.rect(x-w*.4+k*6*s,y-70*s-k*4*s,w*.7,9*s,.2)});
    const px=x+rr(-.15,.15)*w;spot('barrow',px,y-60*s,o=>{const s2=S(o,42*s);peekCat(px,y-60*s+s2*.15,s2,o)});
    add('paper',2,q=>q.poly([[x-w/2,y-60*s],[x+w/2,y-60*s],[x+w*.35,y-28*s],[x-w*.4,y-28*s]],true,.4));
    add('paper',2,q=>q.ell(x+d*w*.5,y-17*s,17*s,17*s,.05));add('none',1,q=>{const cx=x+d*w*.5;for(let k=0;k<4;k++){const a=k/4*3.14;q.line(cx-Math.cos(a)*14*s,y-17*s-Math.sin(a)*14*s,cx+Math.cos(a)*14*s,y-17*s+Math.sin(a)*14*s,.1)}});
  }
  function deer(x,y){const s=pk(y)*1.1,d=sgn(),g=R()<.4;
    add('none',2.2,q=>{for(const a of[-24,-15,18,26])q.line(x+d*a*s,y-52*s,x+d*a*s+rr(-3,3)*s,y,.3)});
    add('paper',2,q=>q.ell(x,y-60*s,34*s,16*s,.05));
    if(g){add('paper',2,q=>q.poly([[x+d*20*s,y-70*s],[x+d*30*s,y-58*s],[x+d*48*s,y-22*s],[x+d*40*s,y-18*s]],true,.3));add('paper',1.8,q=>{q.ell(x+d*48*s,y-14*s,11*s,7*s,.08,d*1.1);q.ell(x+d*40*s,y-26*s,4*s,8*s,.1,-d*.5)})}
    else{add('paper',2,q=>q.poly([[x+d*18*s,y-70*s],[x+d*32*s,y-66*s],[x+d*38*s,y-100*s],[x+d*28*s,y-104*s]],true,.3));
      add('paper',1.8,q=>{q.ell(x+d*40*s,y-106*s,13*s,7*s,.08,d*.35);q.ell(x+d*28*s,y-118*s,4*s,9*s,.1,-d*.4);q.ell(x+d*36*s,y-118*s,4*s,9*s,.1,d*.3)});add('ink',0,q=>{q.ell(x+d*38*s,y-108*s,1.8*s,1.8*s,.1);q.ell(x+d*52*s,y-104*s,2.2*s,2*s,.1)})}
    add('paper',1.2,q=>q.ell(x-d*33*s,y-62*s,6*s,9*s,.1));
  }
  // stébla s mezerou uprostřed, ve které vykukuje hlava kočky (vysoká stébla se jí vyhnou)
  const blades=(q,x,y,w,n,h0,h1,lean,gap)=>{for(let i=0;i<n;i++){let bx=x+rr(-.5,.5)*w,hh=rr(h0,h1),ln=rr(-lean,lean);const u=bx-x,sd=u<0?-1:1;
    if(Math.abs(u)<gap){bx=x+sd*(gap+Math.abs(u)*.4);ln=sd*Math.abs(ln)}else if(Math.abs(u+ln)<gap*.8)ln=-ln;
    q.curve([[bx,y+4],[bx+ln*.3,y-hh*.55],[bx+ln,y-hh]],false)}};
  function lgrass(x,y){const w=rr(70,120);
    spot('grass',x,y-30,o=>peekCat(x+o.dir*4,y-22,S(o,48),o));
    add('none',1.5,q=>blades(q,x,y,w,Math.round(w/5),40,85,18,20));
  }
  function bigGrass(x,y){const w=rr(120,180);
    spot('grass',x,y-60,o=>peekCat(x+o.dir*6,y-48,S(o,56),o));
    add('none',1.7,q=>blades(q,x,y,w,Math.round(w/6),70,150,30,28));
    add('paper',1.1,q=>{for(let i=0;i<6;i++){const bx=x+rr(-.5,.5)*w,hy=y-rr(120,170);for(let k=0;k<4;k++)blob(q,bx+(k%2?4:-4),hy+k*9,3,6,5,.08,(k%2?.5:-.5))}});
  }
  // trs lučních květin: uprostřed nízké (kryjí kočce tělo), po stranách vysoké; hlava kočky zůstane nad květy
  function lflowers(x,y){const s=pk(y),n=Math.round(rr(7,11)),F=[];
    for(let i=0;i<n;i++){const u=i/(n-1)*2-1,fx=x+u*80*s+rr(-8,8)*s,mid=Math.abs(fx-x)<40*s;
      F.push({x:fx,y:y+rr(-6,10)*s,h:(mid?rr(10,18):rr(48,88))*s,l:(mid?rr(-5,5):rr(-12,12))*s,r:rr(6,9)*s*(mid?.8:1),t:Math.floor(R()*3)})}
    spot('flowers',x,y,o=>sitCat(x,y,S(o,50*s),o));
    add('none',1.4,q=>{for(const f of F)q.curve([[f.x,f.y],[f.x+f.l*.3,f.y-f.h*.5],[f.x+f.l,f.y-f.h]],false)});
    add('paper',1.2,q=>{for(const f of F)q.ell(f.x+(f.l>0?-7:7)*s,f.y-f.h*.3,9*s,3.6*s,.1,f.l>0?.5:-.5)});
    add('paper',1.3,q=>{for(const f of F){const hx=f.x+f.l,hy=f.y-f.h,r=f.r;
      if(f.t===0)for(let k=0;k<5;k++){const a=k/5*6.283;blob(q,hx+Math.cos(a)*r,hy+Math.sin(a)*r,r*.75,r*.75,6)}
      else if(f.t===1)q.poly([[hx-r,hy-r*.9],[hx-r*.45,hy-r*.35],[hx,hy-r*1.1],[hx+r*.45,hy-r*.35],[hx+r,hy-r*.9],[hx+r*.8,hy+r*.5],[hx-r*.8,hy+r*.5]],true,.15);
      else for(let k=0;k<8;k++){const a=k/8*6.283;blob(q,hx+Math.cos(a)*r*.9,hy+Math.sin(a)*r*.9,r*.55,r*.22,5,.08,a)}}});
    if(F.some(f=>f.t!==1))add('ink',0,q=>{for(const f of F)if(f.t!==1)q.ell(f.x+f.l,f.y-f.h,f.r*.42,f.r*.42,.1)});
  }
  function bigFlowers(x,y){const F=[];for(let i=0;i<Math.round(rr(3,6));i++)F.push({x:x+rr(-70,70),h:rr(90,170),t:Math.floor(R()*4),r:rr(12,18),l:rr(-22,22)});
    // květy před kočkou vysoko nad její hlavou a bez listů, ať nezakryjí obličej
    for(const f of F)if(Math.abs(f.x+f.l-x)<52){f.h=Math.max(f.h,140);f.mid=1}
    spot('flowers',x,y,o=>sitCat(x,y,S(o,54),o));
    add('none',1.6,q=>{for(const f of F)q.curve([[f.x,y+4],[f.x+f.l*.3,y-f.h*.5],[f.x+f.l,y-f.h]],false)});
    if(F.some(f=>!f.mid))add('paper',1.3,q=>{for(const f of F)if(!f.mid){q.ell(f.x+f.l*.15+12,y-f.h*.3,14,4.5,.1,-.5);q.ell(f.x+f.l*.25-11,y-f.h*.45,12,4,.1,.5)}});
    for(const f of F){const hx=f.x+f.l,hy=y-f.h,r=f.r;
      if(f.t===0){add('paper',1.2,q=>{for(let k=0;k<10;k++){const a=k/10*6.283;blob(q,hx+Math.cos(a)*r,hy+Math.sin(a)*r*.8,r*.55,r*.22,6,.08,a)}});add('paper',1.4,q=>q.ell(hx,hy,r*.42,r*.36,.1));add('ink',0,q=>{for(let k=0;k<5;k++)q.ell(hx+rr(-4,4),hy+rr(-3,3),1.2,1.2,.2)})}
      else if(f.t===1){add('paper',1.4,q=>{for(let k=0;k<4;k++){const a=k/4*6.283+.4;blob(q,hx+Math.cos(a)*r*.55,hy+Math.sin(a)*r*.45,r*.78,r*.65,8)}});add('ink',0,q=>q.ell(hx,hy,r*.3,r*.26,.1))}
      else if(f.t===2){add('paper',1.2,q=>{const p=[];for(let k=0;k<16;k++){const a=k/16*6.283;p.push([hx+Math.cos(a)*r*(k%2?1:.5),hy+Math.sin(a)*r*(k%2?1:.5)*.85])}q.poly(p,true,.2)});add('shade',0,q=>q.ell(hx,hy,r*.4,r*.35,.1))}
      else{add('none',.9,q=>{for(let k=0;k<18;k++){const a=k/18*6.283;q.line(hx,hy,hx+Math.cos(a)*r*1.2,hy+Math.sin(a)*r*1.2,.1)}});add('ink',0,q=>q.ell(hx,hy,3,3,.1))}}
  }
  function butterfly(x,y,s){
    add('paper',1.2,q=>{q.ell(x-7*s,y-5*s,7*s,5*s,.1,-.5);q.ell(x+7*s,y-5*s,7*s,5*s,.1,.5);q.ell(x-5*s,y+4*s,5*s,4*s,.1,.4);q.ell(x+5*s,y+4*s,5*s,4*s,.1,-.4)});
    add('none',1.3,q=>{q.line(x,y-7*s,x,y+7*s,.1);q.curve([[x,y-7*s],[x-3*s,y-13*s],[x-6*s,y-14*s]],false);q.curve([[x,y-7*s],[x+3*s,y-13*s],[x+6*s,y-14*s]],false)});
  }

  /* voda: potok s mostkem a rybník s mólem, loďkou a rákosím */
  function stream(sx,y0,y1,sw){const L=[],Rt=[];for(let y=y0;y<=y1;y+=20){const x=sx(y),w=sw(y)/2;L.push([x-w,y]);Rt.push([x+w,y])}
    add('shade',1.6,q=>q.curve(L.concat(Rt.reverse()),true));
    add('none',1.3,q=>{for(let y=y0+30;y<y1;y+=rr(30,50)){const x=sx(y),w=sw(y)*.3;q.line(x-w,y,x+w*.6,y+2,.2)}},'paper');
    add('paper',1.3,q=>{for(let i=0;i<14;i++){const y=rr(y0+20,y1),x=sx(y)+(R()<.5?-1:1)*(sw(y)/2+rr(2,8)),r=rr(5,9)*pk(y);q.ell(x,y,r,r*.6,.1)}});
  }
  function bridge(x,y,sw){const s=pk(y),L=sw+130*s,hh=48*s,dk=10*s,oh=sw/2+10*s,rh=34*s,ty=y-hh-dk+2,tx=x+rr(-.12,.12)*L;
    const yl=t=>y+6-(hh+6)*Math.pow(Math.sin(Math.PI*t),.8);
    add('shade',1.4,q=>q.curve([[x-oh,y+4],[x-oh*.85,y-hh*.7],[x,y-hh-2],[x+oh*.85,y-hh*.7],[x+oh,y+4]],true));
    spot('bridge',x,y,o=>peekCat(x,y+2,S(o,34*s),o));
    const lo=[],up=[];for(let k=0;k<=12;k++){const t=k/12,xx=x-L/2+L*t;lo.push([xx,yl(t)]);up.push([xx,yl(t)-dk])}
    add('paper',2,q=>q.poly(lo.concat(up.reverse()),true,.3));
    add('none',1,q=>{for(let k=1;k<12;k++){const t=k/12,xx=x-L/2+L*t;q.line(xx,yl(t),xx,yl(t)-dk,.1)}});
    add('none',2.2,q=>{const P=[];for(let k=0;k<=4;k++){const t=.06+k*.22,xx=x-L/2+L*t;q.line(xx,yl(t)-dk,xx,yl(t)-dk-rh,.2);P.push([xx,yl(t)-dk-rh])}q.curve(P,false);
      const M=P.map(([a,b])=>[a,b+rh*.5]);q.curve(M,false)});
    // kočka sedí na mostku před zábradlím (zábradlí by přes ni vedlo čáry)
    spot('bridgetop',tx,ty,o=>sitCat(tx,yl(.5+(tx-x)/L)-dk+1,S(o,40*s),o));
    add('paper',1.6,q=>{for(const e of[-1,1]){q.ell(x+e*(L/2+6*s),y+6,16*s,8*s,.15);q.ell(x+e*(L/2-10*s),y+10,11*s,6*s,.15)}});
  }
  function pondDraw(pdx,pdy,prx,pry){
    const P=[];for(let i=0;i<18;i++){const a=i/18*6.283,k=1+rr(-.06,.06);P.push([pdx+Math.cos(a)*prx*k,pdy+Math.sin(a)*pry*k])}
    const eAt=(a,f)=>[pdx+Math.cos(a)*prx*f,pdy+Math.sin(a)*pry*f];
    add('none',1.1,q=>q.curve(P.map(([x,y])=>[pdx+(x-pdx)*1.05,pdy+(y-pdy)*1.12]),true));
    add('shade',2.2,q=>q.curve(P,true));
    add('none',1.5,q=>{for(let i=0;i<11;i++){const x=pdx+rr(-.6,.6)*prx,y=pdy+rr(-.5,.6)*pry,l=rr(18,60);q.line(x-l,y,x+l,y+rr(-2,2),.3)}},'paper');
    // lekníny
    const lil=[];for(let g=0;g<3;g++){const[gx,gy]=eAt(rr(0,6.283),rr(.3,.65));for(let i=0;i<Math.round(rr(3,6));i++)lil.push([gx+rr(-55,55),gy+rr(-14,14),rr(13,20)])}
    add('paper',1.3,q=>{for(const[x,y,r]of lil)blob(q,x,y,r*1.05,r*.42,8)});
    add('none',1,q=>{for(const[x,y,r]of lil)q.line(x,y,x+r*.9,y-r*.15,.1)});
    add('paper',1.2,q=>{for(let i=0;i<3;i++){const[x,y]=lil[Math.floor(R()*lil.length)],p=[];for(let k=0;k<10;k++){const a=k/10*6.283;p.push([x+Math.cos(a)*(k%2?4:10),y-6+Math.sin(a)*(k%2?3:7)])}q.poly(p,true,.2)}});
    // rákosí (vzadu a po stranách); kočka vykukuje mezi stébly
    const reed=(a,cat)=>{const[rx,ry]=eAt(a,.97),st=[];for(let i=0;i<13;i++)st.push([rx+rr(-36,36),rr(60,130),rr(-14,14)]);
      // mezera ve stéblech, ve které vykukuje hlava kočky (stébla by ji jinak přeškrtala)
      if(cat)for(const e of st){const u=e[0]-rx,sd=u<0?-1:1;if(Math.abs(u)<26){e[0]=rx+sd*(24+Math.abs(u)*.5);e[2]=sd*Math.abs(e[2])}}
      add('paper',1.2,q=>{for(let i=0;i<4;i++){const bx=rx+rr(-30,30);q.curve([[bx,ry+8],[bx+rr(-30,30),ry-rr(30,50)],[bx+rr(-50,50),ry-rr(40,70)],[bx+rr(-8,8),ry-10]],true)}});
      if(cat)spot('reeds',rx,ry,o=>peekCat(rx+o.dir*4,ry-4,S(o,46),o));
      add('none',1.6,q=>{for(const[bx,hh,ln]of st)q.curve([[bx,ry+8],[bx+ln*.3,ry-hh*.5],[bx+ln,ry-hh]],false)});
      add('ink',0,q=>{for(let i=0;i<4;i++){const[bx,hh,ln]=st[i];q.ell(bx+ln*.95,ry-hh*.85,4,12,.1)}})};
    const ra=[Math.PI*rr(1.12,1.3),Math.PI*rr(1.42,1.58),Math.PI*rr(1.7,1.88)];
    // čtvrtý trs po straně; trs, přes který by vedla jeho stébla, je bez kočky
    const a4=R()<.5?rr(-.25,.1):Math.PI+rr(-.1,.25),near=a=>Math.abs(eAt(a,1)[0]-eAt(a4,1)[0])<130;
    for(let i=0;i<3;i++)reed(ra[i],(i!==1||R()<.5)&&!near(ra[i]));
    reed(a4,true);
    // kachny
    add('paper',1.6,q=>{for(let i=0;i<2;i++){const[x,y]=eAt(rr(0,6.283),rr(.2,.5)),d=i?1:-1;q.ell(x,y,16,7,.05);q.ell(x+d*12,y-12,6,6,.1);q.poly([[x+d*17,y-13],[x+d*25,y-11],[x+d*17,y-9]],true,.1)}});
    // mólo a loďka
    const ja=Math.PI/2+rr(-.5,.5),[jx,jy0]=eAt(ja,1.02),jl=pry*rr(.95,1.15),jt=jy0-jl,w0=74,w1=54,sx=jx+rr(-.2,.2)*w1,bs=sgn();
    const jw=y=>w1+(w0-w1)*(y-jt)/(jy0-jt);
    add('none',3,q=>{for(let k=0;k<3;k++){const yy=jt+(jy0-jt)*k/2;for(const e of[-1,1])q.line(jx+e*jw(yy)/2*.9,yy,jx+e*jw(yy)/2*.9,yy+14+k*6,.2)}});
    add('paper',2,q=>{q.poly([[jx-w0/2,jy0],[jx+w0/2,jy0],[jx+w1/2,jt],[jx-w1/2,jt]],true,.4);q.rect(jx-w0/2,jy0,w0,8,.2)});
    add('none',1,q=>{for(let k=1;k<9;k++){const yy=jt+(jy0-jt)*k/9;q.line(jx-jw(yy)/2,yy,jx+jw(yy)/2,yy,.1)}});
    spot('jetty',sx,jt+16,o=>sitCat(sx,jt+16,S(o,44),o));
    const bx=jx+bs*(w1/2+74),by=jt+jl*.4;
    add('none',1.2,q=>q.curve([[jx+bs*w1/2,by-4],[jx+bs*(w1/2+20),by+6],[bx-bs*50,by-14]],false));
    add('shade',1.6,q=>q.ell(bx,by-16,60,11,.05));
    spot('boat',bx,by-14,o=>{const s2=S(o,42);peekCat(bx+o.dir*10,by-18+s2*.2,s2,o)});
    add('paper',2.2,q=>q.poly([[bx-68,by-18],[bx+68,by-18],[bx+50,by+6],[bx-54,by+6]],true,.4));
    add('none',1.1,q=>{q.line(bx-60,by-10,bx+60,by-10,.2);q.line(bx-bs*20,by-20,bx-bs*90,by+14,.2)});
    add('paper',1.2,q=>q.ell(bx-bs*92,by+16,10,5,.1,bs*.5));
    add('paper',1.4,q=>{for(let i=0;i<9;i++){const[x,y]=eAt(rr(.2,2.9),rr(1.02,1.08));q.ell(x,y,rr(9,16),rr(5,8),.15)}});
    // velký kámen na předním břehu, na něm se dá ležet
    {const a=Math.PI/2+(ja<Math.PI/2?1:-1)*rr(.6,.9),[x,y]=eAt(a,1.06);add('paper',2,q=>q.ell(x,y-8,34,16,.1));add('none',1,q=>q.curve([[x-20,y-14],[x-4,y-19],[x+12,y-13]],false));
      spot('shore',x,y-22,o=>loafCat(x,y-20,S(o,42),o))}
  }

  /* sestavení */
  function meadow(){
    sky();mountains();fields();forestBack();
    for(let x=rr(-30,30);x<W+40;x+=rr(110,170)){const b=FE-rr(15,45);if(R()<.6)spruce(x,b,rr(.48,.66),null);else leafy(x,b,rr(.5,.62),null)}
    ground();
    for(let i=0;i<5;i++){const x=rr(80,W-80);add('none',1,q=>{for(let k=0;k<5;k++){const a=-Math.PI/2+rr(-1.1,1.1),l=rr(30,50);q.curve([[x,FE+12],[x+Math.cos(a)*l*.5,FE+12+Math.sin(a)*l*.6],[x+Math.cos(a)*l,FE+12+Math.sin(a)*l*.8]],false)}})}
    meadowTex();
    // ostrůvky kvítí
    for(let i=0;i<4;i++){const cx=rr(150,W-150),cy=rr(FE+120,H-150),k=pk(cy);add('paper',1,q=>{for(let j=0;j<26;j++){const x=cx+rr(-130,130)*k,y=cy+rr(-40,40)*k,r=rr(3,5)*k;dot(q,x,y,r,r*.8)}});
      add('ink',0,q=>{for(let j=0;j<14;j++)q.rect(cx+rr(-120,120)*k,cy+rr(-36,36)*k,2*k,2*k,0)})}
    // cesta v perspektivě
    const PA=rr(1050,1950),PB=Math.max(500,Math.min(2500,PA+rr(-450,450))),PC=(PA+PB)/2+sgn()*rr(170,320),y0=FE-30,y1=H;
    const px=y=>{const t=(y-y0)/(y1-y0);return(1-t)*(1-t)*PA+2*t*(1-t)*PC+t*t*PB},pw=y=>28+Math.max(0,y-FE)/(H-FE)*250;
    {const L=[],Rt=[];for(let y=y0;y<=y1;y+=30){const x=px(y),w=pw(y)/2;L.push([x-w,y]);Rt.push([x+w,y])}
      add('paper',1.8,q=>q.curve(L.concat(Rt.reverse()),true));
      add('none',1,q=>{for(const f of[-.42,.42]){const p=[];for(let y=FE;y<=H+20;y+=40)p.push([px(y)+f*pw(y)/2,y]);q.curve(p,false)}
        for(let i=0;i<80;i++){const y=rr(FE+20,H),x=px(y)+rr(-.18,.18)*pw(y),k=pk(y);ln(q,x,y,x-2*k,y-8*k);ln(q,x,y,x+3*k,y-9*k)}});
      add('paper',1,q=>{for(let i=0;i<45;i++){const y=rr(FE+30,H),k=pk(y),x=px(y)+(R()<.5?-1:1)*rr(.25,.6)*pw(y)/2;blob(q,x,y,5*k,3*k,5)}})}
    // rybník na jedné straně cesty, potok z lesa do rybníka
    const pdy=rr(1500,1580),prx=rr(330,400),pry=rr(115,140);let d=sgn(),pdx=0;
    for(let k=0;k<2;k++){pdx=px(pdy)+d*(pw(pdy)/2+prx+rr(100,200));if(pdx>prx+50&&pdx<W-prx-50)break;d=-d}
    pdx=Math.max(prx+50,Math.min(W-prx-50,pdx));
    const yS=FE+6,yE=pdy-pry*.8,ph=R()*6,amp=rr(25,45);let xs=pdx+d*rr(0,180),xe=pdx+d*rr(0,80);
    const sw=y=>14+Math.max(0,y-FE)*.1;let sx=y=>{const t=(y-yS)/(yE-yS);return xs+(xe-xs)*t+Math.sin(t*6+ph)*amp*(1-t*.6)};
    for(let k=0;k<6;k++){let bad=false;for(let y=yS;y<=yE;y+=20)if(Math.abs(sx(y)-px(y))<pw(y)/2+sw(y)/2+60)bad=true;
      if(!bad)break;xs=Math.max(60,Math.min(W-60,xs+d*90));xe=Math.max(prx*.3+pdx-prx,Math.min(pdx+prx*.7,xe+d*40))}
    stream(sx,yS,yE,sw);
    // pramen: kameny u okraje lesa
    add('paper',1.8,q=>{const x=sx(yS);q.ell(x-sw(yS)/2-12,yS+2,16,9,.12);q.ell(x+sw(yS)/2+10,yS,13,8,.12);q.ell(x+4,yS-4,12,6,.12)});
    // kameny na břehu potoka
    const ST=[];for(const y of[rr(FE+40,FE+90),rr(Math.max(FE+100,yE-120),yE-40)]){const e=sgn();ST.push([sx(y)+e*(sw(y)/2+10),y,pk(y),e])}
    const by=rr(FE+110,Math.min(pdy-pry-70,FE+190)),bxx=sx(by),bL=sw(by)+130*pk(by),ts=Math.sign(px(by)-bxx)||1;
    add('none',1.1,q=>{const a=[bxx+ts*bL/2,by+6],b=[px(by+40)-ts*pw(by+40)/2,by+40],c=[bxx-ts*(bL/2+180),FE+14];
      for(const[p1,p2]of[[a,b],[[bxx-ts*bL/2,by+6],c]])for(let t=0;t<1;t+=.06){const u=t+.03;ln(q,p1[0]+(p2[0]-p1[0])*t,p1[1]+(p2[1]-p1[1])*t,p1[0]+(p2[0]-p1[0])*u,p1[1]+(p2[1]-p1[1])*u)}});
    // kočka na kameni u potoka: horní kámen hned (u mostku bez kočky – zábradlí by ji přeškrtlo),
    // dolní u ústí se kreslí až po rybníku, jinak by kočku přeškrtalo rákosí
    const stoneAt=([x,y,k,e],cat)=>{add('paper',1.8,q=>{q.ell(x+e*22*k,y+6*k,14*k,8*k,.12);q.ell(x,y,24*k,11*k,.12)});
      if(cat)spot('stream',x,y-8*k,o=>loafCat(x,y-9*k,S(o,40*k),o))};
    {const[x,y]=ST[0];stoneAt(ST[0],!(Math.abs(x-bxx)<bL/2+60&&y>by-150&&y<by+50))}
    // rozmístění předmětů bez nesmyslných překryvů (cesta, potok a rybník jsou zabrané):
    // w, d = šířka a hloubka půdorysu, fr = volno před předmětem (kočka u jeho paty),
    // h, vw = výška a šířka obrysu: vyšší předmět vpředu nesmí zakrýt vršek (kde bývá kočka) předmětu za sebou
    const objs=[],taken=[];
    // hide = koruna zakryje celý předmět za sebou (do 600 jednotek dozadu)
    const block=(x0,x1,ya,yb,y=0,h=0,v0=0,v1=0,hide=0)=>taken.push({x0,x1,ya,yb,y,h,v0,v1,hide});
    const free=(x,y,w,d,h,vw,hide,fr)=>x>-10&&x<W+10&&!taken.some(t=>x-w/2-14<t.x1&&x+w/2+14>t.x0&&y-d<t.yb&&y+fr>t.ya||
      h>0&&t.h>0&&x-vw/2<t.v1&&x+vw/2>t.v0&&(t.y<y?y-h<t.y-t.h+50||hide&&t.y>y-600:t.y-t.h<y-h+50||t.hide&&y>t.y-600));
    // sh = šířka šrafovaného stínu pod předmětem
    const put=(f,x,y,{w=100,d=40,h=0,vw=w,fr=12,sh=0,hide=0}={})=>{if(!free(x,y,w,d,h,vw,hide,fr))return false;block(x-w/2,x+w/2,y-d,y+fr,y,h,x-vw/2,x+vw/2,hide);
      objs.push({f:sh?(a,b)=>{shadow(a,b,sh);f(a,b)}:f,x,y});return true};
    const tryPut=(f,ya,yb,o,xa=60,xb=W-60)=>{for(let i=0;i<24;i++)if(put(f,rr(xa,xb),rr(ya,yb),o))return true;return false};
    for(let y=y0;y<H;y+=50)block(Math.min(px(y),px(y+50))-pw(y+50)/2-8,Math.max(px(y),px(y+50))+pw(y+50)/2+8,y,y+50);
    for(let y=yS;y<yE;y+=20)block(sx(y)-sw(y)/2-10,sx(y)+sw(y)/2+10,y,y+20);
    // rybník: vysoké věci těsně před ním by zakryly kočky na předním břehu, mole a v loďce
    block(pdx-prx-70,pdx+prx+70,pdy-pry-10,pdy+pry+30,pdy+pry,110,pdx-prx-40,pdx+prx+40);
    for(const[x,y]of ST)block(x-50,x+50,y-40,y+15,y,50,x-45,x+45);
    block(bxx-bL/2-10,bxx+bL/2+10,by-20,by+20,by+8,90,bxx-bL/2,bxx+bL/2);
    objs.push({f:()=>pondDraw(pdx,pdy,prx,pry),x:pdx,y:pdy-pry},{f:()=>bridge(bxx,by,sw(by)),x:bxx,y:by+8},{f:()=>stoneAt(ST[1],true),x:ST[1][0],y:pdy-pry+.5});
    // seník, posed a krmelec stojí v mýtině na okraji lesa (stromy se jim vyhnou)
    const gaps=[];
    for(const[f,gw,ya,yb,o]of[[barn,330,FE+120,FE+190,{w:400,d:90,h:330,vw:470,fr:150,sh:360}],[(x,y)=>{const d=sgn(),ux=x+d*rr(4,24);spot('understand',ux,y-2,o=>sitCat(ux,y-2,S(o,40*pk(y)),o));stand(x,y,'stand')},230,FE+10,FE+45,{w:170,h:410,fr:60}],[feeder,180,FE+10,FE+45,{w:200,h:150,fr:100}]])
      for(let i=0;i<30;i++){const x=rr(300,W-300);if(gaps.some(g=>Math.abs(g[0]-x)<g[1]+gw+60))continue;if(put(f,x,rr(ya,yb),o)){gaps.push([x,gw]);break}}
    // okraj lesa: stromy několika druhů (před kmenem necháme volno pro kočku za kmenem)
    const row=[];
    // široké listnáče stojí o kus dál, úzké smrky, břízy a suché stromy před nimi (nezakryjí se kočky v korunách)
    // sdílený strom (kočka v koruně bez ohledu na sousedy) stojí úplně vpředu, aby mu korunu nic nepřekrylo
    for(let x=rr(-10,60);x<W+30;x+=rr(180,280)){const sc=rr(.85,1.12),t=R(),y0=t<.36||t>=.76&&t<.9?rr(FE-30,FE):rr(FE+8,FE+40),y=t>=.24&&t<.36?FE+42:y0;
      if(gaps.some(g=>Math.abs(g[0]-x)<g[1]))continue;
      const g=t<.24?(a,b)=>leafy(a,b,sc,'tree'):t<.36?(a,b)=>tree(a,b,sc):t<.6?(a,b)=>spruce(a,b,sc,'spruce'):t<.76?(a,b)=>birch(a,b,sc,'birch'):t<.9?(a,b)=>oak(a,b,sc,'tree'):(a,b)=>snag(a,b,sc);
      const hw=(t<.24?175:t<.36?180:t<.6?125:t<.76?135:t<.9?235:120)*sc;
      const e={x,y,hw,av:[]},f=(a,b)=>{avoid=e.av;g(a,b);avoid=[]};if(put(f,x,y,{w:120,h:90,vw:110,fr:45}))row.push(e)}
    for(const e of row)e.av=row.filter(o=>o.y>e.y&&Math.abs(o.x-e.x)<600).map(o=>[o.x,o.hw]);
    for(let i=0;i<10;i++)tryPut(peekForest,FE+2,FE+14,{w:60,d:20,h:40});
    tryPut((x,y)=>leafy(x,y,rr(1.15,1.3),'tree'),1350,1650,{w:110,d:60,h:570,vw:500,fr:40,sh:300,hide:1});
    tryPut(pasture,1560,1820,{w:620,d:200,h:180,fr:60},340,W-340);
    for(let i=0;i<40;i++){const y=rr(1250,1800),sd=sgn();if(put(signpost,px(y)+sd*(pw(y)/2+rr(52,80)),y,{w:60,h:180,vw:200,fr:60}))break}
    tryPut(hives,1260,1560,{w:300,d:50,h:110,fr:40,sh:260});
    for(let i=0;i<2;i++)tryPut(woodpile,FE+100,1480,{w:200,d:50,h:80,fr:30,sh:180});
    tryPut(deer,FE+60,FE+160,{w:110,h:100});
    // lavička u cesty, když se tam nevejde, tak kdekoli na louce
    {const bf=(x,y)=>{const ux=x+rr(-40,40);spot('underbench',ux,y-4,o=>sleepCat(ux,y-4,S(o,40),o));bench(x,y)},bo={w:220,d:50,h:100,fr:50};let ok=false;
      for(let i=0;i<20&&!ok;i++){const y=rr(1480,1850),sd=sgn();ok=put(bf,px(y)+sd*(pw(y)/2+rr(110,150)),y,bo)}
      if(!ok)tryPut(bf,1300,1850,bo)}
    tryPut(picnic,1400,1880,{w:200,d:60,h:80,fr:30});tryPut(wagon,1300,1750,{w:300,d:60,h:200,vw:420,fr:40,sh:0});tryPut(barrow,1300,1800,{w:170,d:50,h:90,fr:40,sh:120});
    for(let i=0;i<5;i++)tryPut(hay,1250,1800,{w:170,d:60,h:150,fr:80,sh:160});
    for(let i=0;i<5;i++)tryPut(fern,FE+20,FE+120,{w:120,d:30,h:70});
    for(let i=0;i<8;i++)tryPut(stump,1200,1900,{w:90,h:60,sh:90});
    for(let i=0;i<3;i++)tryPut(logp,1200,1780,{w:240,h:140,sh:200});
    for(let i=0;i<5;i++)tryPut(rock,1250,1950,{w:140,h:80,sh:130});
    for(let i=0;i<7;i++)tryPut(bush,1220,1950,{w:190,d:50,h:110,sh:170});
    for(let i=0;i<3;i++)tryPut(lflowers,1250,1850,{w:150,d:30,h:90,vw:190});
    for(let i=0;i<10;i++)tryPut(lgrass,1250,1850,{w:110,d:30,h:80});
    for(let i=0;i<2;i++)tryPut(shrooms,1200,1900,{w:70,d:30,h:40});
    for(let i=0;i<3;i++)tryPut(molehill,1250,1900,{w:60,d:20});
    tryPut(anthill,FE+60,1400,{w:90,d:30,h:50});
    for(let i=0;i<7;i++)tryPut(bigGrass,1900,H-12,{w:160,h:150,vw:220},30,W-30);
    for(let i=0;i<3;i++)tryPut(bigFlowers,1900,H-12,{w:150,h:170,vw:240},30,W-30);
    place(objs);
    for(let i=0,n=0;i<40&&n<8;i++){const x=rr(80,W-80),y=rr(1180,1900);if(SP.some(([a,b])=>Math.abs(a-x)<90&&b-y<140&&y-b<90)||objs.some(o=>Math.abs(o.x-x)<110&&y<o.y+20&&y>o.y-220))continue;butterfly(x,y,rr(.9,1.3));n++}
  }

  meadow();
}});
