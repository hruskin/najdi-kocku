// Pláž: obloha s racky a drakem, moře ve více plánech (obzor s trajektem, plachetnice, vlny, příboj),
// maják na skalách, molo na kůlech, řada plážových budek, věž plavčíka, kiosek se zmrzlinou,
// slunečníky, lehátka, hrady z písku a v popředí duny s dřevěným chodníkem.
// Prostředí se registruje přes SCENE(); build(K) dostane sdílené nástroje z jádra (index.html).
SCENE({id:"plaz",ver:3,name:"Pláž",where:"v plážových budkách, za hrady z písku, na lehátkách i v loďkách",
  // kolik koček smí mít jeden druh úkrytu (neuvedený druh = 1)
  caps:{lantern:1,gallery:1,lightdoor:1,rock:2,sailboat:2,buoy:1,pier:2,underpier:2,lamp:1,pierhut:1,crate:1,rowboat:1,
    hut:3,hutcurtain:2,hutroof:1,surf:2,tower:1,towerleg:1,kiosk:1,kioskroof:1,freezer:1,net:1,towel:1,deckchair:2,lounger:2,
    basket:1,blanket:1,castle:2,castletop:1,bucket:1,ring:2,windbreak:2,cooler:1,boat:1,boattop:1,rocks:1,pool:1,dune:2,fence:2,bin:1,bench:1,under:2,menu:1,sign:1,towerroof:1,parasol:1,tent:2,pedalo:1,hutporch:2,bag:1,hole:2,walk:1},
build(K){
  const{R,rr,add,spot,S,sitCat,loafCat,sleepCat,peekCat,pick,arch,place,bucket,bench,sky}=K;
  const HZ=540;

  /* pomocníci */
  // skála: nepravidelný obrys, šrafovaný stín na jedné straně a praskliny; vrací výšku vrcholu
  function rock(cx,by,w,h,sd=1){const p=[[cx-w/2,by],[cx-w*.46,by-h*rr(.4,.6)],[cx-w*rr(.15,.3),by-h*rr(.85,1)],[cx+w*rr(0,.15),by-h],[cx+w*rr(.3,.4),by-h*rr(.6,.8)],[cx+w/2,by-h*rr(.1,.3)],[cx+w*.46,by]];
    add('paper',2.2,q=>q.curve(p,true));
    add('shade',0,q=>q.curve([[cx+sd*w*.16,by-3],[cx+sd*w*.24,by-h*.45],[cx+sd*w*.36,by-h*.32],[cx+sd*w*.38,by-3]],true));
    add('none',1,q=>{q.line(cx-w*.1,by-h*.7,cx+w*.02,by-h*.45,.3);q.line(cx-w*.3,by-h*.3,cx-w*.18,by-h*.2,.3)});
    return by-h*.86}
  function gull(x,y,d){
    add('paper',1.5,q=>{q.ell(x,y-14,14,8,.05);q.ell(x+d*11,y-25,6.5,6,.05)});
    add('none',1.2,q=>{q.line(x-3,y-7,x-4,y,.1);q.line(x+3,y-7,x+4,y,.1);q.poly([[x+d*16,y-26],[x+d*25,y-24],[x+d*16,y-22]],true,.1);q.curve([[x-d*15,y-16],[x-d*2,y-20],[x+d*8,y-15]],false)});
    add('ink',0,q=>q.ell(x+d*13,y-27,1.6,1.6,.1));
  }
  function crab(x,y){
    add('none',1.3,q=>{for(const sd of[-1,1]){for(let k=0;k<3;k++)q.line(x+sd*9,y-5+k*2,x+sd*20,y-1+k*3,.1);q.curve([[x+sd*11,y-10],[x+sd*20,y-18],[x+sd*16,y-24]],false);q.line(x+sd*4,y-14,x+sd*5,y-20,.1)}});
    add('paper',1.5,q=>{q.ell(x,y-8,13,7,.05);q.ell(x-16,y-26,6,4,.1);q.ell(x+16,y-26,6,4,.1)});
    add('ink',0,q=>{q.ell(x-5,y-21,1.8,1.8,.1);q.ell(x+5,y-21,1.8,1.8,.1)});
  }
  function starfish(x,y,r=13){const p=[];for(let k=0;k<10;k++){const a=k/10*6.283-1.57;p.push([x+Math.cos(a)*(k%2?r*.42:r),y+Math.sin(a)*(k%2?r*.42:r)*.6])}
    add('paper',1.4,q=>q.poly(p,true,.2));add('ink',0,q=>{for(let k=0;k<5;k++){const a=k/5*6.283-1.57;q.ell(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.3,1.3,1.3,.1)}})}
  function shells(x,y){const a=[];for(let i=0;i<3;i++)a.push([x+rr(-40,40),y+rr(-8,8),R()<.5]);
    add('paper',1.2,q=>{for(const[sx,sy,f]of a)if(f)q.poly([[sx-9,sy],[sx-6,sy-7],[sx,sy-10],[sx+6,sy-7],[sx+9,sy]],true,.2);else q.ell(sx,sy-5,8,5,.1)});
    add('none',.9,q=>{for(const[sx,sy,f]of a)if(f)for(let k=-2;k<=2;k++)q.line(sx,sy,sx+k*3.5,sy-8,.1);else q.curve([[sx-4,sy-5],[sx,sy-8],[sx+3,sy-5],[sx,sy-3]],false)});
  }
  function seaweed(x,y){add('none',1.3,q=>{for(let i=0;i<4;i++){const bx=x+rr(-24,24);q.curve([[bx,y],[bx+rr(-10,10),y-8],[bx+rr(-16,16),y-rr(12,20)]],false)}})}
  function spade(x,y){const d=R()<.5?-1:1;
    add('none',2.2,q=>{q.line(x,y-6,x+d*18,y-70,.2);q.line(x+d*12,y-70,x+d*24,y-70,.1)});
    add('paper',1.6,q=>q.poly([[x-10,y-8],[x+10,y-8],[x+7,y+4],[x,y+8],[x-7,y+4]],true,.2));
  }
  function ball(x,y){const r=rr(16,22);
    add('paper',2,q=>q.ell(x,y-r,r,r,.04));
    add('shade',0,q=>q.curve([[x,y-2*r+2],[x-r*.55,y-r],[x,y-2],[x-r*.25,y-r]],true));
    add('none',1.2,q=>{q.curve([[x-r,y-r],[x,y-r*1.35],[x+r,y-r]],false);q.curve([[x,y-2*r],[x-r*.4,y-r],[x,y]],false);q.curve([[x,y-2*r],[x+r*.4,y-r],[x,y]],false)});
  }
  // loďka: vnitřek šrafovaný, kočka vykukuje přes bok
  function rowboat(x,y,w,kind,d){const h=w*.21,cx=x-d*rr(.02,.24)*w,oar=R()<.6;
    add('paper',2,q=>q.ell(x,y-h-6,w/2-4,15,.03));
    add('shade',1.2,q=>q.ell(x,y-h-4,w/2-14,10,.03));
    spot(kind,cx,y-h,o=>{const s=S(o,44);peekCat(cx,y-h+s*.07,s,o)});
    add('paper',2.4,q=>q.poly([[x-d*w/2,y-h],[x+d*(w/2+14),y-h-10],[x+d*w*.34,y],[x-d*w*.4,y]],true,.6));
    add('none',1.1,q=>{q.line(x-d*w*.45,y-h*.5,x+d*w*.44,y-h*.58,.3);q.rect(x-d*w*.3-12,y-h*.42,24,10,.2)});
    if(oar){add('none',2.2,q=>q.line(x-d*w*.1,y-h-4,x+d*w*.36,y-h-44,.3));add('paper',1.4,q=>q.ell(x+d*w*.4,y-h-49,7,16,.08,d*.9))}
  }

  /* obloha a vzdálený plán */
  function headland(side){const len=rr(650,850),top=HZ-rr(150,190),X=u=>side<0?u-20:W+20-u;
    const prof=[[0,top],[len*.22,top+rr(0,20)],[len*.48,top+rr(40,70)],[len*.74,HZ-rr(28,44)],[len,HZ+2]];
    const gy=u=>{for(let i=0;i<prof.length-1;i++){const[a,ya]=prof[i],[b,yb]=prof[i+1];if(u<=b)return ya+(yb-ya)*(u-a)/(b-a)}return HZ};
    add('paper',2,q=>q.poly([[X(-40),HZ+30],[X(-40),top],...prof.map(([u,y])=>[X(u),y]),[X(len+60),HZ+30]],true,1.4));
    add('shade',0,q=>q.poly([[X(len*.62),gy(len*.62)+6],[X(len*.9),gy(len*.9)+4],[X(len),HZ+4],[X(len*.6),HZ+4]],true,.8));
    // městečko na svahu: domky, kostelík a stromy
    const hs=[];for(let i=0;i<9;i++){const u=rr(30,len*.62);hs.push([u,gy(u)+rr(4,30),rr(30,52),rr(24,40),R()<.5])}
    hs.sort((a,b)=>a[1]-b[1]);
    const cu=rr(len*.15,len*.45),cy=gy(cu)+6;
    add('paper',1.5,q=>{q.rect(X(cu)-12,cy-96,24,96,.3);q.poly([[X(cu)-15,cy-96],[X(cu),cy-136],[X(cu)+15,cy-96]],true,.2)});
    add('none',1,q=>{q.line(X(cu),cy-136,X(cu),cy-150,.1);q.line(X(cu)-5,cy-145,X(cu)+5,cy-145,.1);q.ell(X(cu),cy-76,5,5,.1)});
    for(const[u,y,w,h,f]of hs){const x=X(u);
      add('paper',1.4,q=>{q.rect(x-w/2,y-h,w,h,.3);if(f)q.poly([[x-w/2-4,y-h],[x,y-h-w*.45],[x+w/2+4,y-h]],true,.2);else q.poly([[x-w/2-3,y-h],[x-w/2+6,y-h-14],[x+w/2-6,y-h-14],[x+w/2+3,y-h]],true,.2)});
      add('shade',0,q=>{for(let k=0;k<2;k++)q.rect(x-w/2+6+k*(w-20),y-h+8,8,9,.1)})}
    add('paper',1.2,q=>{for(let i=0;i<7;i++){const u=rr(20,len*.7);q.ell(X(u),gy(u)-6,rr(9,15),rr(10,16),.08)}});
    // nábřeží pod městečkem: zídka s oblouky a lampami
    const pe=len*rr(.7,.8);
    add('paper',1.6,q=>q.poly([[X(-30),HZ-20],[X(pe),HZ-20],[X(pe+20),HZ],[X(-30),HZ]],true,.3));
    add('none',1,q=>{for(let u=10;u<pe-20;u+=34)q.poly(arch(X(u)+(side<0?8:-8),HZ-12,8,HZ),false,.1);for(let u=40;u<pe;u+=110){q.line(X(u),HZ-20,X(u),HZ-46,.1);q.ell(X(u),HZ-48,3,3,.1)}});
  }
  function farIsland(x){const w=rr(500,700),h=rr(40,70);
    add('paper',1.6,q=>q.curve([[x-w/2,HZ+4],[x-w*.25,HZ-h*.8],[x,HZ-h],[x+w*.3,HZ-h*.6],[x+w/2,HZ+4]],true));
    add('none',1,q=>{for(let i=0;i<5;i++){const px=x+rr(-.3,.3)*w;q.line(px,HZ-h*.4,px+rr(10,26),HZ-h*.2,.3)}});
  }
  function ferry(x,y,d){const w=rr(300,350),hh=24,c1=x-d*w*.08;
    add('paper',2,q=>q.poly([[x-d*w/2,y-hh],[x+d*(w/2+10),y-hh-8],[x+d*(w/2-30),y],[x-d*(w/2-10),y]],true,.4));
    add('none',1,q=>{q.line(x-d*(w/2-8),y-hh+9,x+d*(w/2-10),y-hh+4,.2);for(let k=0;k<8;k++)q.ell(x-d*w*.36+d*k*w*.1,y-hh+15,2.6,2.6,.1)});
    add('paper',1.8,q=>{q.rect(c1-w*.3,y-hh-28,w*.6,28,.3);q.rect(c1-w*.2,y-hh-52,w*.36,24,.3)});
    add('shade',0,q=>{for(let k=0;k<11;k++)q.rect(c1-w*.28+k*w*.052,y-hh-22,9,10,.1);for(let k=0;k<6;k++)q.rect(c1-w*.17+k*w*.055,y-hh-46,8,9,.1)});
    const fx=c1-d*w*.13;
    add('paper',1.6,q=>q.poly([[fx-14,y-hh-52],[fx+14,y-hh-52],[fx+12+d*4,y-hh-92],[fx-12+d*4,y-hh-92]],true,.2));
    add('shade',0,q=>q.rect(fx-12+d*3,y-hh-86,24,10,.1));
    add('none',1.3,q=>{q.curve([[fx+d*4,y-hh-98],[fx-d*30,y-hh-120],[fx-d*70,y-hh-116],[fx-d*110,y-hh-134]],false);q.curve([[fx-d*20,y-hh-112],[fx-d*50,y-hh-132],[fx-d*90,y-hh-128]],false);
      for(let k=0;k<5;k++){const px=x+rr(-.4,.4)*w;q.line(px,y+6+k*3,px+rr(20,40),y+6+k*3,.2)}});
    add('none',1.1,q=>{q.line(c1-w*.3,y-hh-40,c1+w*.3,y-hh-40,.2);for(let k=0;k<=8;k++){const px=c1-w*.3+k*w*.075;q.line(px,y-hh-28,px,y-hh-40,.1)}});
  }
  function sailboat(x,y,s,cat){const d=R()<.5?-1:1,sh=R()<.4,cx=x-d*18*s;
    add('none',1.6,q=>q.line(x,y-14*s,x,y-110*s,.2));
    add(sh?'shade':'paper',1.6,q=>q.poly([[x+d*4*s,y-106*s],[x+d*4*s,y-22*s],[x+d*48*s,y-22*s]],true,.4));
    add('paper',1.6,q=>q.poly([[x-d*4*s,y-90*s],[x-d*4*s,y-22*s],[x-d*34*s,y-22*s]],true,.4));
    add('paper',1.2,q=>q.poly([[x,y-110*s],[x-d*14*s,y-104*s],[x,y-98*s]],true,.2));
    if(cat)spot('sailboat',cx,y-14*s,o=>{const k=S(o,40)*.6;peekCat(cx,y-14*s+k*.14,k,o)});
    add('paper',1.8,q=>q.poly([[x-50*s,y-14*s],[x+50*s,y-14*s],[x+36*s,y],[x-36*s,y]],true,.4));
    add('none',1,q=>{for(let k=0;k<3;k++)q.line(x-30*s+k*18*s,y+5+k*3,x-10*s+k*18*s,y+5+k*3,.2)});
  }
  function kite(kx,ky,ax,ay){const d=R()<.5?-1:1;
    add('none',.9,q=>q.curve([[kx,ky+40],[kx+(ax-kx)*.3,ky+(ay-ky)*.45],[ax,ay]],false));
    add('paper',1.8,q=>q.poly([[kx,ky-44],[kx+30,ky-6],[kx,ky+40],[kx-30,ky-6]],true,.3));
    add('shade',0,q=>q.poly([[kx+2,ky-38],[kx+26,ky-7],[kx+2,ky-7]],true,.2));
    add('none',1.1,q=>{q.line(kx,ky-44,kx,ky+40,.2);q.line(kx-30,ky-6,kx+30,ky-6,.2);q.curve([[kx,ky+40],[kx+d*18,ky+70],[kx-d*6,ky+100],[kx+d*14,ky+130]],false)});
    add('paper',1,q=>{for(let k=0;k<3;k++){const[bx,by]=[kx+d*[10,-2,9][k],ky+[60,90,120][k]];q.poly([[bx-8,by-5],[bx+8,by+5],[bx+8,by-5],[bx-8,by+5]],true,.1)}});
  }

  /* moře */
  function lighthouse(x,base,guard){const bw=112,tw=66,top=base-rr(440,470),G=top+70,L=base-G,hw=y=>bw/2+(tw/2-bw/2)*(base-y)/L-2,
      band=Math.floor(R()*3),gs=R()<.5?-1:1,gx=x+gs*(tw/2+12),ds=R()<.5?-1:1,dx=x+ds*6;
    const tl=rock(x-130,base+40,190,96,-1),tr=rock(x+140,base+44,210,84,1),lx=x-150,rx2=x+160;
    spot('rock',lx,tl+6,o=>sitCat(lx,tl+6,S(o,44)*.8,o));guard(lx,tl+6);
    spot('rock',rx2,tr+6,o=>o.alt?sleepCat(rx2,tr+8,S(o,46)*.8,o):sitCat(rx2,tr+6,S(o,44)*.8,o));guard(rx2,tr+6);
    add('paper',2.4,q=>q.poly([[x-bw/2,base],[x+bw/2,base],[x+tw/2,G],[x-tw/2,G]],true,.6));
    const seg=(y0,y1)=>[[x-hw(y0),y0],[x+hw(y0),y0],[x+hw(y1),y1],[x-hw(y1),y1]];
    add('shade',0,q=>{if(band===0){for(const k of[1,3])q.poly(seg(base-L*k/5,base-L*(k+1)/5),true,.3)}
      else if(band===1){for(let k=0;k<4;k++){const y0=base-L*k/4-10,y1=y0-L/8;q.poly([[x-hw(y0),y0],[x+hw(y0),y0-30],[x+hw(y1),y1-30],[x-hw(y1),y1]],true,.3)}}
      else q.poly(seg(base-4,base-L*.45),true,.3)});
    add('shade',1.2,q=>{for(const k of[.4,.72]){const yy=base-L*k;q.poly(arch(x,yy-26,8,yy),true,.2)}});
    add('paper',2,q=>q.rect(x-bw/2-26,base,bw+52,16,.4));
    add('shade',1.6,q=>q.poly(arch(x,base-66,17,base),true,.3));
    spot('lightdoor',dx,base+2,o=>sitCat(dx,base+2,S(o,44)*.6,o));guard(dx,base+2);
    // lucerna, ochoz se zábradlím a kopule
    add('paper',2.2,q=>q.rect(x-tw/2-18,G-10,tw+36,12,.4));
    add('shade',1.8,q=>q.rect(x-tw/2+6,G-62,tw-12,52,.4));
    spot('lantern',x,G-10,o=>peekCat(x+o.dir*5,G-12,S(o,38)*.6,o));
    add('none',1,q=>{q.line(x-tw/2+6,G-36,x+tw/2-6,G-36,.2)});
    spot('gallery',gx,G-10,o=>sitCat(gx,G-9,S(o,34)*.5,o));
    add('none',1.4,q=>{q.line(x-tw/2-16,G-32,x+tw/2+16,G-32,.2);for(let k=0;k<=6;k++){const px=x-tw/2-16+k*(tw+32)/6;q.line(px,G-10,px,G-32,.1)}});
    add('paper',2.2,q=>q.curve([[x-tw/2-2,G-60],[x-tw/2+4,G-84],[x,G-98],[x+tw/2-4,G-84],[x+tw/2+2,G-60]],true));
    add('paper',1.4,q=>q.ell(x,G-102,6,6,.1));
    add('none',1.2,q=>{q.line(x,G-108,x,G-126,.1);for(const s of[-1,1]){q.line(x+s*(tw/2+22),G-44,x+s*300,G-110,.6);q.line(x+s*(tw/2+22),G-30,x+s*300,G+10,.6)}});
    // přední kameny a pěna kolem ostrůvku
    rock(x-60,base+76,150,62,-1);rock(x+86,base+82,120,48,1);
    add('paper',1.2,q=>{for(let i=0;i<9;i++)q.ell(x+rr(-260,260),base+rr(66,92),rr(10,22),rr(3,6),.1)});
  }
  function buoy(x,y){
    add('paper',1.2,q=>q.ell(x,y-2,40,8,.05));
    add('none',1.8,q=>{q.line(x-12,y-60,x-6,y-98,.2);q.line(x+12,y-60,x+6,y-98,.2);q.line(x,y-60,x,y-102,.2)});
    add('paper',1.6,q=>q.ell(x,y-104,9,9,.05));
    add('paper',2,q=>q.poly([[x-30,y-6],[x+30,y-6],[x+18,y-60],[x-18,y-60]],true,.3));
    add('shade',0,q=>q.poly([[x-24,y-24],[x+24,y-24],[x+21,y-40],[x-21,y-40]],true,.2));
    add('paper',1.6,q=>q.rect(x-22,y-66,44,7,.2));
    spot('buoy',x,y-66,o=>sitCat(x,y-65,S(o,38),o));
    add('none',1,q=>{for(let k=0;k<3;k++)q.line(x-40+k*8,y+6+k*4,x+30-k*6,y+6+k*4,.2)});
  }
  // molo: bočně, mírně ubíhá do dálky (xa,ya = konec u břehu, xb,yb = konec na moři)
  function pier(xa,xb,ya,yb,guard,tb){const PD=Math.sign(xb-xa),len=Math.abs(xb-xa),X=t=>xa+(xb-xa)*t,Y=t=>ya+(yb-ya)*t,sc=t=>1-.26*t,DEP=34;
    const band=(f0,f1)=>{const a=[],b=[];for(let i=0;i<=24;i++){const t=i/24;a.push([X(t),Y(t)+f0*sc(t)]);b.push([X(t),Y(t)+f1*sc(t)])}return a.concat(b.reverse())};
    const np=Math.round(len/110),pt=[];for(let i=0;i<np;i++)pt.push((i+.5)/np);
    // pod palubou: stín, kůly, vzpěry, trám (a kočky na něm)
    add('shade',0,q=>q.poly(band(14,50),true,.3));
    add('paper',1.8,q=>{for(const t of pt){const s=sc(t);q.rect(X(t)-6*s,Y(t)+14*s,12*s,94*s,.3)}});
    add('none',1.5,q=>{for(let i=0;i<np-1;i++){const a=pt[i],b=pt[i+1];q.line(X(a),Y(a)+24*sc(a),X(b),Y(b)+92*sc(b),.3);q.line(X(a),Y(a)+92*sc(a),X(b),Y(b)+24*sc(b),.3)}});
    add('paper',1.8,q=>q.poly(band(62,72),true,.3));
    for(let i=0;i<np-1;i++){const t=(pt[i]+pt[i+1])/2,s=sc(t),ux=X(t),uy=Y(t)+62*s;if(t<.3||R()>.5||Math.abs(t-tb)<.15)continue;   // u uvázané loďky ne, zakryla by kočku
      spot('underpier',ux,uy,o=>loafCat(ux,uy,S(o,34)*s,o));guard(ux,uy,60,50)}
    add('paper',1.1,q=>{for(const t of pt){const s=sc(t),y=Y(t)+108*s;if(t>.25)q.ell(X(t),y,15*s,4*s,.1)}});
    // paluba: vrchní plocha s prkny a čelo
    add('paper',2,q=>q.poly(band(-DEP,0),true,.4));
    add('none',.9,q=>{for(let i=1;i<70;i++){const t=i/70,s=sc(t);q.line(X(t)+PD*5*s,Y(t)-DEP*s,X(t),Y(t),.2)}});
    add('paper',2,q=>q.poly(band(0,15),true,.4));
    add('paper',1.8,q=>{const s=sc(1);q.poly([[xb,yb-DEP*s],[xb+PD*6,yb-DEP*s+4],[xb+PD*6,yb+15*s+2],[xb,yb+15*s]],true,.2)});
    // zadní zábradlí a lampy
    const nr=Math.round(len/70);
    add('none',2,q=>{const a=[],b=[];for(let i=0;i<=nr;i++){const t=i/nr,s=sc(t),x=X(t),y=Y(t)-DEP*s;q.line(x,y,x,y-52*s,.2);a.push([x,y-52*s]);b.push([x,y-28*s])}q.poly(a,false,.3);q.poly(b,false,.3)});
    for(const t of[rr(.14,.3),rr(.48,.64)]){const s=sc(t),lx=X(t),ly=Y(t)-DEP*s,lt=ly-176*s;
      add('none',2.6,q=>{q.line(lx,ly,lx,lt+24*s,.2);q.curve([[lx,lt+64*s],[lx+PD*16*s,lt+48*s],[lx,lt+34*s]],false)});
      add('paper',1.8,q=>{q.poly([[lx-9*s,lt+24*s],[lx+9*s,lt+24*s],[lx+13*s,lt],[lx-13*s,lt]],true,.2);q.rect(lx-18*s,lt-6*s,36*s,6*s,.2)});
      spot('lamp',lx,lt-6*s,o=>loafCat(lx,lt-5*s,S(o,34)*s,o));guard(lx,lt-6*s,60,50)}
    // rybářská bouda na konci mola, kočka v okně
    {const t=.9,s=sc(t),hx=X(t),hb=Y(t)-DEP*s*.4,hw=96*s,hh=96*s,wy=hb-hh+22*s;
      add('paper',2.2,q=>q.rect(hx-hw/2,hb-hh,hw,hh,.4));
      add('none',1,q=>{for(let k=1;k<6;k++)q.line(hx-hw/2+k*hw/6,hb-hh+4,hx-hw/2+k*hw/6,hb-2,.2)});
      add('shade',1.4,q=>q.rect(hx-24*s,wy,48*s,36*s,.3));
      spot('pierhut',hx,wy+36*s,o=>peekCat(hx+o.dir*4*s,wy+38*s,S(o,40)*s,o));guard(hx,wy+36*s,60,50);
      add('paper',1.6,q=>q.rect(hx-30*s,wy+34*s,60*s,7*s,.2));
      add('paper',2.2,q=>q.poly([[hx-hw/2-10*s,hb-hh+2],[hx,hb-hh-40*s],[hx+hw/2+10*s,hb-hh+2]],true,.3));
      add('paper',1.4,q=>{q.ell(hx-PD*30*s,hb-24*s,13*s,13*s,.05)});
      add('none',1,q=>{q.ell(hx-PD*30*s,hb-24*s,6*s,6*s,.05);for(let k=0;k<4;k++){const a=k*1.571+.78;q.line(hx-PD*30*s+Math.cos(a)*6*s,hb-24*s+Math.sin(a)*6*s,hx-PD*30*s+Math.cos(a)*13*s,hb-24*s+Math.sin(a)*13*s,.1)}});
      gull(hx+PD*10*s,hb-hh-38*s,-PD)}
    // věci na palubě: kočky, bedna s rybami, stolička, lano, kyblík; pruty přes zábradlí
    const ty=['pier','pier','pier','pier','crate','stool','rope','pail','gull'];for(let i=ty.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[ty[i],ty[j]]=[ty[j],ty[i]]}
    const rods=[];
    ty.forEach((k,i)=>{const t=.05+i*.088+rr(-.015,.015),s=sc(t),x=X(t),y=Y(t)-DEP*s*.4;
      if(k==='pier'){spot('pier',x,y,o=>o.alt?loafCat(x,y,S(o,42)*s,o):sitCat(x,y,S(o,44)*s,o));guard(x,y,60,70)}
      else if(k==='crate'){add('shade',1.4,q=>q.rect(x-26*s,y-34*s,52*s,8*s,.2));
        spot('crate',x,y-30*s,o=>{const k=S(o,40)*s;peekCat(x+o.dir*4*s,y-30*s+k*.14,k,o)});guard(x,y-20*s,60,50);
        add('paper',1.8,q=>q.rect(x-28*s,y-30*s,56*s,30*s,.3));add('none',1,q=>{q.line(x-28*s,y-15*s,x+28*s,y-15*s,.2);q.line(x-10*s,y-30*s,x-10*s,y,.2);q.line(x+10*s,y-30*s,x+10*s,y,.2)});
        add('paper',1.2,q=>q.poly([[x+18*s,y-30*s],[x+32*s,y-44*s],[x+36*s,y-36*s],[x+30*s,y-30*s]],true,.2))}
      else if(k==='stool'){add('none',2,q=>{q.line(x-12*s,y-30*s,x-15*s,y,.1);q.line(x+12*s,y-30*s,x+15*s,y,.1)});add('paper',1.6,q=>{q.ell(x,y-31*s,17*s,5*s,.05);q.rect(x+20*s,y-18*s,26*s,18*s,.2)});rods.push(t)}
      else if(k==='gull')gull(x,y,R()<.5?-1:1);
      else if(k==='rope')add('none',1.6,q=>{for(let r=6;r<=18;r+=4)q.ell(x,y-5*s,r*s,r*.35*s,.05)});
      else{add('paper',1.8,q=>q.poly([[x-14*s,y-30*s],[x+14*s,y-30*s],[x+11*s,y],[x-11*s,y]],true,.2));add('none',1.4,q=>q.curve([[x-14*s,y-30*s],[x,y-48*s],[x+14*s,y-30*s]],false));rods.push(t)}});
    // přední zábradlí se záchranným kruhem, rybářské pruty
    add('none',2,q=>{const a=[],b=[];for(let i=0;i<=nr;i++){const t=i/nr,s=sc(t),x=X(t),y=Y(t);q.line(x,y,x,y-46*s,.2);a.push([x,y-46*s]);b.push([x,y-24*s])}q.poly(a,false,.3);q.poly(b,false,.3)});
    {const t=rr(.32,.6),s=sc(t),x=X(t)+PD*14*s,y=Y(t)-20*s;add('paper',1.6,q=>q.ell(x,y,15*s,15*s,.05));
      add('none',1,q=>{q.ell(x,y,7*s,7*s,.05);for(let k=0;k<4;k++){const a=k*1.571+.78;q.line(x+Math.cos(a)*7*s,y+Math.sin(a)*7*s,x+Math.cos(a)*15*s,y+Math.sin(a)*15*s,.1)}})}
    add('none',1.4,q=>{for(const t of rods){const s=sc(t),x=X(t),y=Y(t)-DEP*s*.4,tx=x+PD*74*s,tyy=y-96*s;q.line(x-PD*6*s,y-4*s,tx,tyy,.2);
      q.curve([[tx,tyy],[tx+PD*6*s,tyy+80*s],[tx+PD*4*s,Y(t)+116*s]],false)}});
    return{X,Y,sc};
  }

  /* pláž */
  // plážová budka: 4 vzory stěny, 3 střechy, dveře otevřené / se závěsem / zavřené; surf u krajních
  function hut(x,y,ss){const w=rr(94,112),h=rr(148,170),top=y-h,d=R()<.5?-1:1,pat=Math.floor(R()*4),rf=Math.floor(R()*3),dr=R(),
      dw=46,dh=rr(104,114),cx=x+rr(-.1,.1)*w,B=y-12,dt=B-dh,rx=x+rr(-.2,.2)*w,tw=R()<.45,L=x-w/2,Rt=x+w/2;
    add('paper',1.8,q=>q.rect(L-10,y-12,w+20,12,.4));
    add('none',1,q=>{for(let px=L+12;px<Rt+4;px+=24)q.line(px,y-11,px,y-1,.2)});
    add('paper',2.2,q=>q.rect(L,top,w,h-12,.6));
    if(pat===0)add('shade',0,q=>{for(let k=1;k<6;k+=2)q.rect(L+k*w/6,top+2,w/6,h-16,.2)});
    else if(pat===1)add('none',1,q=>{for(let yy=top+14;yy<B;yy+=14)q.line(L+2,yy,Rt-2,yy,.3)});
    else if(pat===2){add('shade',0,q=>q.rect(L+2,B-h*.36,w-4,h*.36-2,.2));add('none',1,q=>{q.line(L,B-h*.36,Rt,B-h*.36,.3);for(let px=L+14;px<Rt-4;px+=14)q.line(px,top+4,px,B-h*.36,.3)})}
    else add('none',1,q=>{for(let px=L+12;px<Rt-4;px+=12)q.line(px,top+4,px,B-2,.3)});
    if(dr<.72){add('shade',1.8,q=>q.rect(cx-dw/2,dt,dw,dh,.4));
      if(dr<.42){spot('hut',cx,B,o=>sitCat(cx+o.dir*4,B-1,S(o,44),o));
        add('paper',1.8,q=>q.poly([[cx+d*dw/2,dt],[cx+d*(dw/2+22),dt+8],[cx+d*(dw/2+22),B-4],[cx+d*dw/2,B]],true,.3))}
      else{const sd=-d,kx=cx+d*6;spot('hutcurtain',kx,B,o=>sitCat(kx,B-1,S(o,44),o));
        // závěs stažený k jedné straně
        add('paper',1.4,q=>q.poly([[cx+sd*dw/2,dt],[cx-sd*dw/2,dt],[cx-sd*dw/2,dt+12],[cx,dt+28],[cx+sd*dw*.12,dt+dh*.5],[cx+sd*dw*.06,B],[cx+sd*dw/2,B]],true,.4));
        add('none',1,q=>{q.curve([[cx+sd*dw*.36,dt+4],[cx+sd*dw*.3,dt+dh*.5],[cx+sd*dw*.36,B-4]],false);q.ell(cx+sd*dw*.2,dt+dh*.5,5,3,.1)})}}
    else{add('paper',1.8,q=>q.rect(cx-dw/2,dt,dw,dh,.4));add('shade',1.2,q=>q.ell(cx,dt+26,10,10,.05));add('ink',0,q=>q.ell(cx-d*16,dt+dh*.55,2.5,2.5,.1));
      // před zavřenými dveřmi spí kočka na stupínku
      spot('hutporch',cx,y,o=>sleepCat(cx,y-2,S(o,46),o))}
    if(tw){const tx=cx>x?L+14:Rt-14;add('ink',0,q=>q.ell(tx,top+26,2,2,.1));
      add('paper',1.3,q=>q.poly([[tx-11,top+28],[tx+11,top+28],[tx+12,top+76],[tx-10,top+78]],true,.3));add('none',1,q=>{q.line(tx-11,top+62,tx+12,top+62,.2);q.line(tx-11,top+68,tx+12,top+68,.2)})}
    if(rf===0){add('paper',2.2,q=>q.poly([[L-14,top+4],[x,top-42],[Rt+14,top+4]],true,.5));add('none',1,q=>q.line(x-18,top-18,x+18,top-18,.2));
      spot('hutroof',x,top-40,o=>sitCat(x,top-39,S(o,42),o))}
    else if(rf===1){add('paper',2.2,q=>q.rect(L-10,top-14,w+20,16,.4));add('none',1,q=>{for(let px=L-10;px<Rt+6;px+=15)q.curve([[px,top+2],[px+7.5,top+9],[px+15,top+2]],false)});
      spot('hutroof',rx,top-14,o=>loafCat(rx,top-13,S(o,40),o))}
    else{const a=[];for(let k=0;k<=10;k++){const t=k/10*Math.PI;a.push([x-Math.cos(t)*(w/2+8),top+4-Math.sin(t)*30])}
      add('paper',2.2,q=>q.poly(a,true,.4));add('none',1,q=>{for(let k=1;k<5;k++)q.line(x+(k-2.5)*w*.2,top+2,x+(k-2.5)*w*.22,top-18,.2)});
      spot('hutroof',x,top-26,o=>sitCat(x,top-25,S(o,42),o))}
    if(ss){const bx=x+ss*(w/2+2),sx=bx+ss*34,rot=-ss*.1,s=Math.sin(rot),c=Math.cos(rot),by=y-88;
      spot('surf',sx,y,o=>sitCat(sx,y-1,S(o,44),o));
      add('paper',2,q=>q.ell(bx,by,15,88,.02,rot));
      add('none',1.2,q=>{q.line(bx+88*s*.8,by-88*c*.8,bx-88*s*.8,by+88*c*.8,.2);q.line(bx+88*s*.5-8,by-88*c*.5,bx+88*s*.5+8,by-88*c*.5,.1)})}
  }
  function lifeguard(x,y){const ph=rr(200,225),pw=150,yp=y-ph,d=R()<.5?-1:1,lx=x+rr(-26,26),cx=x+rr(-.22,.22)*pw;
    add('shade',0,q=>q.ell(x+14,y-2,pw*.7,13,.05));
    add('none',3,q=>{q.line(x-pw/2+22,yp,x-pw/2+34,y-8,.4);q.line(x+pw/2-22,yp,x+pw/2-34,y-8,.4)});
    spot('towerleg',lx,y,o=>sitCat(lx,y-2,S(o,48),o));
    add('none',3.4,q=>{q.line(x-pw/2+6,yp,x-pw/2-14,y,.4);q.line(x+pw/2-6,yp,x+pw/2+14,y,.4)});
    add('none',1.8,q=>{const m=yp+ph*.42;q.line(x-pw/2-6,m,x+pw/2+6,m,.3);q.line(x-pw/2+2,yp+12,x+pw/2+4,m,.3);q.line(x+pw/2-2,yp+12,x-pw/2-4,m,.3)});
    add('none',2.2,q=>{const a=x+d*pw*.18,b=x+d*(pw/2+56);q.line(a-8,yp+4,b-8,y,.3);q.line(a+10,yp+4,b+10,y,.3);for(let k=1;k<8;k++){const t=k/8;q.line(a-8+(b-a)*t,yp+4+(y-yp-4)*t,a+10+(b-a)*t,yp+4+(y-yp-4)*t,.2)}});
    add('paper',2.2,q=>q.rect(x-pw/2-10,yp,pw+20,14,.4));
    add('paper',2,q=>q.rect(x-pw/2+8,yp-104,pw-16,104,.4));
    add('shade',1.4,q=>q.rect(x-pw/2+20,yp-92,pw-40,36,.3));
    spot('tower',cx,yp-54,o=>peekCat(cx,yp-48,S(o,46),o));
    add('paper',2.2,q=>q.rect(x-pw/2,yp-54,pw,54,.4));
    add('none',4,q=>{q.line(x,yp-46,x,yp-12,.1);q.line(x-17,yp-29,x+17,yp-29,.1)});
    add('paper',2.2,q=>q.poly([[x-pw/2-22,yp-100],[x+pw/2+22,yp-100],[x+pw/2,yp-134],[x-pw/2,yp-134]],true,.4));
    add('none',1.8,q=>q.line(x-d*pw*.3,yp-134,x-d*pw*.3,yp-204,.2));
    add('shade',1.4,q=>q.poly([[x-d*pw*.3,yp-204],[x-d*pw*.3+d*44,yp-196],[x-d*pw*.3+d*40,yp-176],[x-d*pw*.3,yp-180]],true,.3));
    {const sx=x+d*pw*.26;spot('towerroof',sx,yp-134,o=>sitCat(sx,yp-133,S(o,40),o))}
    const rx=x-d*(pw/2+10),ry=yp+36;
    add('paper',1.8,q=>q.ell(rx,ry,19,19,.05));
    add('none',1.1,q=>{q.ell(rx,ry,9,9,.05);for(let k=0;k<4;k++){const a=k*1.571+.78;q.line(rx+Math.cos(a)*9,ry+Math.sin(a)*9,rx+Math.cos(a)*19,ry+Math.sin(a)*19,.1)}});
  }
  function kiosk(x,y){const w=rr(210,240),h=rr(170,190),top=y-h,d=R()<.5?-1:1,cx=x+rr(-.22,.22)*w,rx=x-d*w*.22,kx=x+d*w*.24,fx=x+d*(w/2+52),mx=x-d*(w/2+34);
    add('paper',2.4,q=>q.rect(x-w/2,top,w,h,.6));
    add('none',1,q=>{for(let px=x-w/2+16;px<x+w/2-8;px+=16)q.line(px,top+124,px,y-2,.3)});
    add('shade',1.6,q=>q.rect(x-w*.4,top+40,w*.8,72,.4));
    add('none',1,q=>q.line(x-w*.4,top+64,x+w*.4,top+64,.3));
    add('paper',1,q=>{for(let k=0;k<6;k++)q.rect(x-w*.36+k*w*.13,top+46,12,17,.2)});
    spot('kiosk',cx,top+112,o=>peekCat(cx,top+114,S(o,46),o));
    add('paper',2.2,q=>q.rect(x-w/2-8,top+110,w+16,14,.4));
    add('paper',1.2,q=>{for(let k=0;k<3;k++){const px=x+d*(w*.3+k*12);q.poly([[px-5,top+96],[px+5,top+96],[px,top+110]],true,.1);q.ell(px,top+94,5.5,5.5,.1)}});
    add('paper',2,q=>q.poly([[x-w/2-16,top+36],[x+w/2+16,top+36],[x+w/2+4,top+4],[x-w/2-4,top+4]],true,.4));
    add('shade',0,q=>{for(let k=0;k<8;k+=2){const a=k/8,b=(k+1)/8,lx=t=>x-w/2-16+t*(w+32),ux=t=>x-w/2-4+t*(w+8);q.poly([[lx(a),top+36],[lx(b),top+36],[ux(b),top+5],[ux(a),top+5]],true,.2)}});
    add('paper',1.6,q=>{for(let k=0;k<8;k++){const a=x-w/2-16+k*(w+32)/8,b=a+(w+32)/8;q.curve([[a,top+36],[(a+b)/2,top+50],[b,top+36]],true)}});
    add('paper',2.2,q=>q.rect(x-w/2-6,top-10,w+12,12,.4));
    // velký kornout na střeše
    add('none',2,q=>q.line(kx,top-10,kx,top-26,.2));
    add('paper',2,q=>q.poly([[kx-24,top-86],[kx+24,top-86],[kx,top-24]],true,.3));
    add('none',1,q=>{for(let k=0;k<4;k++){q.line(kx-20+k*10,top-86,kx+4+k*4,top-40,.1);q.line(kx+20-k*10,top-86,kx-4-k*4,top-40,.1)}});
    add('paper',2,q=>{q.ell(kx,top-96,26,16,.06);q.ell(kx-4,top-118,19,14,.06)});
    add('ink',0,q=>{for(let k=0;k<5;k++)q.ell(kx+rr(-16,16),top-rr(90,124),1.8,1.8,.1)});
    spot('kioskroof',rx,top-10,o=>loafCat(rx,top-9,S(o,42),o));
    // mraznička a stojan s cenami
    add('paper',2.2,q=>q.rect(fx-42,y-58,84,58,.4));
    add('paper',2,q=>q.rect(fx-46,y-68,92,12,.3));
    add('none',1.2,q=>{q.rect(fx-10,y-46,20,26,.2);q.line(fx,y-20,fx,y-10,.1)});
    spot('freezer',fx,y-68,o=>loafCat(fx,y-67,S(o,40),o));
    // za stojanem s cenami (kočka napůl schovaná za tabulí)
    {const sx=mx-d*27;spot('menu',sx,y,o=>sitCat(sx,y-2,S(o,40),o))}
    add('none',2,q=>{q.line(mx-24,y,mx-4,y-90,.2);q.line(mx+24,y,mx+4,y-90,.2)});
    add('paper',1.8,q=>q.poly([[mx-8,y-90],[mx+8,y-90],[mx+22,y-14],[mx-22,y-14]],true,.3));
    add('none',1,q=>{for(let k=0;k<4;k++)q.line(mx-10-k*2,y-72+k*14,mx+8+k*2,y-72+k*14,.2)});
  }
  function vnet(x,y){const w=rr(340,400),nt=y-rr(150,165),nb=nt+46,sx=x+rr(-.3,.3)*w,bx=x+rr(-.4,.4)*w;
    add('none',1,q=>{q.line(x-w/2,nt-10,x-w/2-50,y+4,.2);q.line(x+w/2,nt-10,x+w/2+50,y+4,.2)});
    spot('net',sx,y,o=>sitCat(sx,y-2,S(o,48),o));
    add('none',3.2,q=>{q.line(x-w/2,y,x-w/2,nt-12,.3);q.line(x+w/2,y,x+w/2,nt-12,.3)});
    add('none',.9,q=>{for(let px=x-w/2;px<=x+w/2;px+=13)q.line(px,nt,px,nb,.2);for(let py=nt+11;py<nb;py+=11)q.line(x-w/2,py,x+w/2,py,.2)});
    add('paper',1.8,q=>{q.rect(x-w/2,nt-4,w,8,.3);q.rect(x-w/2,nb-3,w,6,.3)});
    ball(Math.abs(bx-sx)<70?sx+(bx<sx?-70:70):bx,y+rr(-6,10));   // míč leží v písku (letící zakrýval kočky v budkách za sítí)
  }
  // slunečník (kopule s dílky / hranatý s třásněmi / slaměný) s ručníkem pod ním
  function umbrellaSet(x,y){const tw=rr(120,150),td=rr(40,52),sh=Math.floor(R()*3),tp=Math.floor(R()*3),r=rr(88,112),px=x+rr(-.3,.3)*tw,ph=rr(165,200),lean=rr(-26,26),ux=px+lean,uy=y-td-ph,cx=x+rr(-.18,.18)*tw,it=R(),ix=x+(cx>x?-1:1)*tw*.3;
    const T=[[x-tw/2,y],[x+tw/2,y],[x+tw/2-14,y-td],[x-tw/2+14,y-td]],P=(u,v)=>[T[0][0]+(T[1][0]-T[0][0])*u+(T[3][0]-T[0][0]+(T[2][0]-T[3][0]-T[1][0]+T[0][0])*u)*v,y-td*v];
    add('shade',0,q=>q.ell(ux+30,y-td*.5,r*.8,td*.7,.05));
    add('paper',1.6,q=>q.poly(T,true,.5));
    if(tp===0)add('none',1,q=>{for(let k=1;k<8;k++){const a=P(k/8,0),b=P(k/8,1);q.line(a[0],a[1],b[0],b[1],.2)}});
    else if(tp===1)add('shade',0,q=>{for(const u of[.14,.62])q.poly([P(u,.04),P(u+.2,.04),P(u+.2,.96),P(u,.96)],true,.2)});
    else{add('ink',0,q=>{for(let i=1;i<7;i++)for(let j=1;j<3;j++){const p=P(i/7,j/3);q.ell(p[0],p[1],2.4,1.6,.1)}});add('none',1,q=>{for(let k=0;k<5;k++){q.line(x-tw/2+2+k*2.5,y-k*td/5,x-tw/2-8+k*2.5,y-k*td/5,.1);q.line(x+tw/2-2-k*2.5,y-k*td/5,x+tw/2+8-k*2.5,y-k*td/5,.1)}})}
    if(it<.3)add('paper',1.2,q=>{q.ell(ix-7,y-td*.4,5,11,.1,.2);q.ell(ix+7,y-td*.4,5,11,.1,.2)});
    else if(it<.55){add('paper',1.3,q=>q.poly([[ix-14,y-td*.2],[ix+12,y-td*.26],[ix+14,y-td*.72],[ix-12,y-td*.66]],true,.2));add('none',1.3,q=>{q.ell(ix+26,y-td*.5,6,5,.1);q.ell(ix+40,y-td*.5,6,5,.1);q.line(ix+32,y-td*.5,ix+34,y-td*.5,.1)})}
    else if(it<.75)add('paper',1.4,q=>{q.ell(ix,y-td*.45,22,8,.06);q.ell(ix,y-td*.45-6,11,8,.06)});
    // tyč je zapíchnutá za ručníkem, kočka leží před ní
    add('none',2.6,q=>q.line(px,y-td+4,ux,uy,.3));
    spot('towel',cx,y-td*.32,o=>sleepCat(cx,y-td*.3,S(o,46),o));
    if(sh===0){const M=(f,t)=>[ux-r*Math.cos(t)*Math.cos(f),uy+r*.14*Math.cos(t)*Math.sin(f)-r*.5*Math.sin(t)],out=[];
      for(let k=0;k<=12;k++){const t=k/12*Math.PI;out.push([ux-r*Math.cos(t),uy-r*.5*Math.sin(t)])}for(let k=12;k>=0;k--)out.push(M(k/12*Math.PI,0));
      add('paper',2.2,q=>q.poly(out,true,.4));
      add('shade',0,q=>{for(let i=0;i<6;i+=2){const p=[],a=i/6*Math.PI,b=(i+1)/6*Math.PI;for(let k=0;k<=6;k++)p.push(M(a,k/12*Math.PI));for(let k=6;k>=0;k--)p.push(M(b,k/12*Math.PI));q.poly(p,true,.2)}});
      add('none',1.1,q=>{for(let i=1;i<6;i++){const p=[];for(let k=0;k<=6;k++)p.push(M(i/6*Math.PI,k/12*Math.PI));q.poly(p,false,.2)}});
      add('paper',1.3,q=>{for(let i=0;i<6;i++){const a=M(i/6*Math.PI,0),b=M((i+1)/6*Math.PI,0);q.curve([a,[(a[0]+b[0])/2,(a[1]+b[1])/2+9],b],true)}});
      add('paper',1.3,q=>q.ell(ux,uy-r*.5-5,4,6,.1))}
    else if(sh===1){const t=uy-r*.36;
      add('paper',2.2,q=>q.poly([[ux-r,uy],[ux+r,uy],[ux+r*.55,t],[ux-r*.55,t]],true,.4));
      add('shade',0,q=>{q.poly([[ux-r*.62,uy-2],[ux-r*.26,uy-2],[ux-r*.14,t+2],[ux-r*.33,t+2]],true,.2);q.poly([[ux+r*.26,uy-2],[ux+r*.62,uy-2],[ux+r*.33,t+2],[ux+r*.14,t+2]],true,.2)});
      add('paper',1.8,q=>q.poly([[ux-r*.55,t],[ux+r*.55,t],[ux,t-r*.14]],true,.3));
      add('none',1,q=>{for(let px=ux-r+5;px<ux+r;px+=8)q.line(px,uy+1,px+1,uy+10,.2)});
      // kočka rozvalená nahoře na stříšce
      const sx=ux+(cx>x?-1:1)*r*.3;spot('parasol',sx,t,o=>loafCat(sx,t-r*.05,S(o,38),o))}
    else{const t=uy-r*.6,rim=[];for(let k=0;k<=16;k++)rim.push([ux-r+k*r/8,uy+(k%2?11:0)]);
      add('paper',2.2,q=>q.poly([[ux,t],...rim],true,.4));
      add('none',1,q=>{for(let k=1;k<16;k+=2)q.line(ux,t+4,rim[k][0],rim[k][1]-4,.3);q.curve([[ux-r*.6,uy-r*.22],[ux,uy-r*.16],[ux+r*.6,uy-r*.22]],false)})}
  }
  function deckchair(x,y){const d=R()<.5?-1:1,cx=x-12*d,st=R()<.5,ux=x-d*8;
    // pod látkou mezi nohama lehátka
    spot('under',ux,y,o=>loafCat(ux,y-1,S(o,34),o));
    add('none',2.4,q=>{q.line(x-44*d,y,x+34*d,y-112,.3);q.line(x+42*d,y,x-8*d,y-62,.3);q.line(x-52*d,y-50,x+46*d,y-50,.3)});
    add('paper',1.8,q=>q.poly([[x-52*d,y-50],[x+8*d,y-46],[x+36*d,y-108],[x+22*d,y-116],[x-2*d,y-64],[x-52*d,y-62]],true,.4));
    if(st)add('shade',0,q=>q.poly([[x-50*d,y-53],[x+5*d,y-50],[x+29*d,y-104],[x+24*d,y-107],[x-1*d,y-59],[x-50*d,y-58]],true,.2));
    else add('none',1,q=>{q.line(x-40*d,y-56,x+2*d,y-54,.2);q.line(x+12*d,y-70,x+26*d,y-100,.2)});
    spot('deckchair',cx,y-58,o=>sleepCat(cx,y-56,S(o,44),o));
  }
  function lounger(x,y){const w=rr(170,200),d=R()<.5?-1:1,bh=38,cx=x-d*w*.14,tb=R()<.5,tx=x+d*(w/2+34),ux=x-d*w*.2;
    spot('under',ux,y,o=>loafCat(ux,y-1,S(o,34),o));
    add('none',2.4,q=>{q.line(x-d*(w/2-10),y-bh,x-d*(w/2-4),y,.2);q.line(x+d*(w/2-60),y-bh,x+d*(w/2-54),y,.2);q.line(x+d*(w/2-30),y-bh-30,x+d*(w/2-6),y-bh,.2)});
    add('paper',2,q=>q.poly([[x-d*w/2,y-bh-12],[x+d*(w/2-58),y-bh-12],[x+d*(w/2-8),y-bh-72],[x+d*(w/2+4),y-bh-64],[x+d*(w/2-50),y-bh],[x-d*w/2,y-bh]],true,.3));
    add('none',1,q=>{for(let k=1;k<7;k++){const px=x-d*w/2+d*k*(w-58)/7;q.line(px,y-bh-12,px,y-bh,.1)}});
    spot('lounger',cx,y-bh-12,o=>sleepCat(cx,y-bh-11,S(o,44),o));
    if(tb){add('none',2,q=>q.line(tx,y-44,tx,y,.1));add('paper',1.6,q=>{q.ell(tx,y-46,20,6,.05);q.poly([[tx-6,y-72],[tx+6,y-72],[tx+5,y-50],[tx-5,y-50]],true,.1)});add('none',1.2,q=>q.line(tx+2,y-70,tx+8,y-86,.1))}
  }
  function picnic(x,y){const bw=rr(170,200),bd=rr(56,68),d=R()<.5?-1:1,bx=x+d*bw*.26,by=y-bd*.45,sx=x-d*bw*.2,sy=y-bd*.4;
    const A=[x-bw/2,y],Bp=[x+bw/2,y],C=[x+bw/2-20,y-bd],D=[x-bw/2+20,y-bd],P=(u,v)=>[A[0]+(Bp[0]-A[0])*u+(D[0]-A[0]+(C[0]-D[0]-Bp[0]+A[0])*u)*v,y-bd*v];
    add('paper',1.8,q=>q.poly([A,Bp,C,D],true,.4));
    add('shade',0,q=>{for(let i=0;i<6;i++)for(let j=0;j<3;j++)if((i+j)%2)q.poly([P(i/6,j/3),P((i+1)/6,j/3),P((i+1)/6,(j+1)/3),P(i/6,(j+1)/3)],true,.1)});
    add('paper',1.3,q=>{q.ell(x-d*bw*.02,y-bd*.3,14,5,.05);q.rect(x+d*bw*.04,y-bd*.7-24,10,26,.1);q.ell(x-d*bw*.1,y-bd*.62,6,6,.1)});
    spot('blanket',sx,sy,o=>sleepCat(sx,sy,S(o,44),o));
    add('paper',1.8,q=>q.poly([[bx-30,by-36],[bx+30,by-36],[bx+d*12+26,by-66],[bx+d*12-30,by-62]],true,.3));
    add('shade',1.4,q=>q.ell(bx,by-36,30,7,.05));
    spot('basket',bx,by-36,o=>peekCat(bx,by-32,S(o,40),o));
    add('paper',2,q=>q.poly([[bx-32,by-36],[bx+32,by-36],[bx+26,by],[bx-26,by]],true,.3));
    add('none',1,q=>{for(let k=1;k<4;k++)q.line(bx-32+k*2,by-36+k*9,bx+32-k*2,by-36+k*9,.2);for(let k=-2;k<=2;k++)q.line(bx+k*12,by-35,bx+k*10,by-1,.2)});
  }
  // hrady z písku: malé věžičky z kbelíku, klasický hrad, velký hrad s příkopem
  function castleS(x,y){const n=2+(R()<.5?1:0),tw=[],sd=R()<.5?-1:1;for(let i=0;i<n;i++)tw.push([x+(i-(n-1)/2)*40+rr(-6,6),rr(40,62),rr(16,20)]);
    // kočka vykukuje zpoza nejnižší věžičky (vyšší sousedky ji zakrývají jen z boku)
    const tt=tw.reduce((a,b)=>b[1]<a[1]?b:a),sx=tt[0]+sd*3,tall=y-tt[1];
    spot('castle',sx,tall,o=>{const s=S(o,42);peekCat(sx,tall+s*.12,s,o)});
    for(const[tx,th,r]of tw){add('paper',2,q=>q.poly([[tx-r,y],[tx+r,y],[tx+r*.66,y-th],[tx-r*.66,y-th]],true,.4));
      add('none',1,q=>{q.line(tx-r*.9,y-th*.35,tx+r*.9,y-th*.35,.2);q.line(tx-r*.78,y-th*.7,tx+r*.78,y-th*.7,.2)})}
    add('ink',0,q=>{for(let i=0;i<6;i++)q.ell(x+rr(-40,40),y-rr(4,30),1.5,1.5,.2)});
    spade(x+rr(50,70)*(R()<.5?-1:1),y+4);
  }
  function castleM(x,y){const w=rr(110,150),h=rr(56,74),cx=x+rr(-.06,.06)*w,fl=R()<.6;
    spot('castle',cx,y-h,o=>{const s=S(o,46);peekCat(cx,y-h+s*.14,s,o)});
    add('paper',2.2,q=>q.poly([[x-w/2,y],[x+w/2,y],[x+w/2-6,y-h],[x-w/2+6,y-h]],true,.8));
    for(const t of[-.35,.35]){const tx=x+t*w;add('paper',2,q=>q.poly([[tx-18,y-h+2],[tx-18,y-h-36],[tx-12,y-h-36],[tx-12,y-h-44],[tx-4,y-h-44],[tx-4,y-h-36],[tx+4,y-h-36],[tx+4,y-h-44],[tx+12,y-h-44],[tx+12,y-h-36],[tx+18,y-h-36],[tx+18,y-h+2]],true,.4))}
    add('shade',1,q=>q.poly(arch(x,y-30,9,y-2),true,.2));
    if(fl){add('none',1.4,q=>q.line(x+w*.35,y-h-44,x+w*.35,y-h-80,.2));add('paper',1.2,q=>q.poly([[x+w*.35,y-h-80],[x+w*.35+22,y-h-72],[x+w*.35,y-h-64]]))}
    add('ink',0,q=>{for(let i=0;i<8;i++)q.ell(x+rr(-.45,.45)*w,y-rr(4,h-6),1.6,1.6,.2)});
  }
  function castleB(x,y){const w=rr(190,226),h1=rr(46,56),d=R()<.5?-1:1,kw=w*.3,kh=h1+rr(70,86),sx=x-d*(w*.275-7),tw=36;
    add('shade',1.4,q=>q.ell(x,y-8,w/2+34,20,.04));
    add('paper',1.8,q=>q.ell(x,y-12,w/2+8,12,.04));
    spot('castle',sx,y-12-h1,o=>{const s=S(o,42);peekCat(sx,y-14-h1+s*.1,s,o)});
    const cren=(x0,x1,yy,n)=>{const p=[],s=(x1-x0)/n;for(let i=0;i<n;i++){p.push([x0+i*s,yy]);p.push([x0+i*s,yy-8]);p.push([x0+(i+.5)*s,yy-8]);p.push([x0+(i+.5)*s,yy])}p.push([x1,yy]);return p};
    add('paper',2.2,q=>q.poly([[x-w/2+10,y-12],[x+w/2-10,y-12],...cren(x+w/2-18,x-w/2+18,y-12-h1,6)],true,.4));
    for(const s of[-1,1]){const tx=x+s*w*.4;add('paper',2,q=>q.poly([[tx-tw/2,y-10],[tx+tw/2,y-10],[tx+tw/2-4,y-12-h1-40],[tx-tw/2+4,y-12-h1-40]],true,.4));
      add('paper',1.8,q=>q.poly([[tx-tw/2+2,y-12-h1-40],[tx,y-12-h1-78],[tx+tw/2-2,y-12-h1-40]],true,.3))}
    add('paper',2.2,q=>q.poly([[x-kw/2,y-14],[x+kw/2,y-14],...cren(x+kw/2,x-kw/2,y-14-kh,4)],true,.4));
    add('shade',1.2,q=>{q.poly(arch(x,y-44,11,y-14),true,.2);q.rect(x-6,y-14-kh+20,12,14,.1)});
    add('none',1,q=>{q.line(x-kw/2,y-14-kh*.5,x+kw/2,y-14-kh*.5,.2);for(let i=0;i<5;i++){const px=x+rr(-.4,.4)*w,py=y-rr(18,40);q.curve([[px-5,py],[px,py-5],[px+5,py]],false)}});
    add('none',1.4,q=>q.line(x,y-22-kh,x,y-58-kh,.2));add('paper',1.2,q=>q.poly([[x,y-58-kh],[x+d*22,y-50-kh],[x,y-42-kh]],true,.2));
    spot('castletop',x-d*kw*.12,y-22-kh,o=>sitCat(x-d*kw*.12,y-22-kh,S(o,40)*.6,o));
    add('none',1.6,q=>{q.line(x-10,y-12,x-12,y+10,.2);q.line(x+10,y-12,x+12,y+10,.2);for(let k=0;k<3;k++)q.line(x-11,y-4+k*6,x+11,y-4+k*6,.1)});
  }
  function bucketToy(x,y){bucket(x,y);spade(x+rr(34,46)*(R()<.5?-1:1),y+2)}
  // nafukovací kruh (některý s kachní hlavou), kočka sedí uvnitř
  function ring(x,y){const rx=rr(44,54),ry=rx*.42,cy=y-ry,d=R()<.5?-1:1,duck=R()<.35,ir=.5,iy=cy-ry*.12;
    const arcs=(a0,a1,sx,sy,cy0)=>{const p=[];for(let k=0;k<=10;k++){const a=a0+(a1-a0)*k/10;p.push([x+Math.cos(a)*sx,cy0+Math.sin(a)*sy])}return p};
    add('paper',2.2,q=>q.ell(x,cy,rx,ry,.03));
    add('paper',1.6,q=>q.ell(x,iy,rx*ir,ry*ir,.04));
    spot('ring',x,iy,o=>loafCat(x,iy+ry*.12,S(o,40),o));
    add('paper',2.2,q=>q.poly([...arcs(0,Math.PI,rx,ry,cy),...arcs(Math.PI,0,rx*ir,ry*ir,iy)],true,.2));
    add('shade',0,q=>{for(let k=0;k<6;k+=2){const a0=k/6*Math.PI+.04,a1=(k+1)/6*Math.PI-.04;q.poly([...arcs(a0,a1,rx-2,ry-2,cy),...arcs(a1,a0,rx*ir+2,ry*ir+1,iy)],true,.1)}});
    if(duck){const hx=x+d*rx*.7,hy=cy+ry*.2;add('paper',1.8,q=>{q.curve([[hx-8,hy],[hx-6,hy-34],[hx+d*4,hy-44],[hx+10,hy-30],[hx+8,hy]],true);q.ell(hx+d*2,hy-46,13,11,.05)});
      add('paper',1.4,q=>q.poly([[hx+d*12,hy-48],[hx+d*28,hy-44],[hx+d*12,hy-40]],true,.1));add('ink',0,q=>q.ell(hx+d*6,hy-50,2,2,.1))}
  }
  function windbreak(x,y){const n=4+(R()<.5?1:0),seg=rr(52,62),h=rr(80,96),x0=x-n*seg/2,p=[];for(let i=0;i<=n;i++)p.push([x0+i*seg,y+(i%2?-8:4)]);
    const m=Math.floor(n/2),sx=(p[m][0]+p[m+1][0])/2+rr(-10,10),sy=(p[m][1]+p[m+1][1])/2;
    spot('windbreak',sx,sy-h,o=>peekCat(sx,sy-h+8,S(o,44),o));
    add('paper',1.8,q=>{for(let i=0;i<n;i++)q.poly([[p[i][0],p[i][1]-6],[p[i+1][0],p[i+1][1]-6],[p[i+1][0],p[i+1][1]-h],[p[i][0],p[i][1]-h]],true,.3)});
    add('shade',0,q=>{for(let i=0;i<n;i++){const a=p[i],b=p[i+1];for(const f of[.2,.6])q.poly([[a[0]+1,a[1]-h*f-4],[b[0]-1,b[1]-h*f-4],[b[0]-1,b[1]-h*(f+.18)],[a[0]+1,a[1]-h*(f+.18)]],true,.1)}});
    add('none',2.4,q=>{for(const[px,py]of p)q.line(px,py+4,px,py-h-10,.2)});
  }
  function cooler(x,y){const w=rr(70,86),h=rr(44,52);
    add('paper',2.2,q=>q.rect(x-w/2,y-h,w,h,.4));
    add('shade',0,q=>q.rect(x-w/2+3,y-h*.45,w-6,h*.3,.1));
    add('paper',2,q=>q.rect(x-w/2-4,y-h-12,w+8,12,.3));
    add('none',1.8,q=>q.curve([[x-w*.3,y-h-12],[x,y-h-34],[x+w*.3,y-h-12]],false));
    spot('cooler',x,y-h-12,o=>loafCat(x,y-h-11,S(o,40),o));
  }
  function surfs(x,y){const n=2+(R()<.5?1:0),d=R()<.5?-1:1,b=[];for(let i=0;i<n;i++)b.push([x+(i-(n-1)/2)*32,rr(160,200),rr(-.1,.1),R()<.5]);
    const sx=x+d*(n*16+30);
    spot('surf',sx,y,o=>sitCat(sx,y-2,S(o,44),o));
    for(const[bx,l,rot,st]of b){const cy=y-l/2+8,s=Math.sin(rot),c=Math.cos(rot);
      add('paper',2,q=>q.ell(bx,cy,15,l/2,.02,rot));
      if(st)add('shade',0,q=>q.poly([[bx-5*c+l*.3*s,cy-l*.3*c-5*s],[bx+5*c+l*.3*s,cy-l*.3*c+5*s],[bx+5*c-l*.3*s,cy+l*.3*c+5*s],[bx-5*c-l*.3*s,cy+l*.3*c-5*s]],true,.1));
      else add('none',1.1,q=>q.line(bx+l*.42*s,cy-l*.42*c,bx-l*.42*s,cy+l*.42*c,.2))}
    add('paper',1.4,q=>q.curve([[x-n*18,y+4],[x,y-8],[x+n*18,y+4]],false));
  }
  function boatUp(x,y){const w=rr(200,236),h=rr(50,58),d=R()<.5?-1:1,sx=x+rr(-.2,.2)*w,top=y-16-h;
    add('paper',1.8,q=>{q.rect(x-w*.3-12,y-16,24,16,.2);q.rect(x+w*.3-12,y-16,24,16,.2)});
    add('shade',0,q=>q.rect(x-w*.42,y-20,w*.84,6,.1));
    add('paper',2.4,q=>q.poly([[x-d*w/2,y-18],[x-d*w/2,top+16],[x-d*w*.4,top+4],[x-d*w*.1,top],[x+d*w*.2,top+2],[x+d*w*.4,top+14],[x+d*(w/2+12),top+34],[x+d*w*.42,y-18]],true,.5));
    add('shade',0,q=>q.poly([[x-d*(w/2-3),y-20],[x-d*(w/2-3),y-30],[x+d*w*.44,y-32],[x+d*w*.42,y-20]],true,.2));
    add('none',1.1,q=>{q.line(x-d*w/2,y-30,x+d*w*.44,y-32,.3);q.curve([[x-d*w/2,top+30],[x,top+20],[x+d*w*.46,top+34]],false);q.curve([[x-d*w/2,top+46],[x,top+38],[x+d*w*.45,top+52]],false)});
    spot('boattop',sx,top+4,o=>loafCat(sx,top+5,S(o,42),o));
    add('none',2,q=>{q.line(x+d*w*.2,y-6,x+d*w*.56,y+2,.2)});
  }
  function beachBoat(x,y){if(R()<.55)rowboat(x,y,rr(200,236),'boat',R()<.5?-1:1);else boatUp(x,y)}
  function rockpool(x,y){const d=R()<.5?-1:1;
    const t1=rock(x-d*80,y-8,130,74,-d),t2=rock(x+d*40,y-18,100,60,d);
    spot('pool',x-d*80,t1+4,o=>sitCat(x-d*80,t1+4,S(o,44),o));
    add('shade',1.6,q=>q.ell(x+d*6,y+2,70,14,.06));
    starfish(x+d*20,y+2,11);seaweed(x-d*30,y+6);
    const px=x+d*100;spot('rocks',px,y-20,o=>{const s=S(o,42);peekCat(px,y-26+s*.14,s,o)});
    rock(x+d*118,y+12,120,40,d);crab(x-d*10,y+34);
  }
  function bin(x,y){
    spot('bin',x,y-74,o=>{const s=S(o,40);peekCat(x,y-78+s*.15,s,o)});
    add('paper',2.2,q=>q.poly([[x-24,y-72],[x+24,y-72],[x+19,y],[x-19,y]],true,.3));
    add('paper',1.8,q=>q.rect(x-28,y-78,56,8,.2));
    add('none',1,q=>{for(let k=-1;k<=1;k++)q.line(x+k*10,y-64,x+k*8,y-8,.2)});
  }
  // plážová taška (pruhovaná / s kapsou), z ní kouká kočka
  function bag(x,y){const w=rr(60,72),h=rr(50,60),st=R()<.5,d=R()<.5?-1:1;
    // ucha tašky jsou za kočkou (sklopená dozadu), ať jí nepřeškrtnou obličej
    add('none',2,q=>{q.curve([[x-w*.42,y-h],[x-w*.3,y-h-34],[x-w*.12,y-h-2]],false);q.curve([[x+w*.12,y-h-2],[x+w*.3,y-h-34],[x+w*.42,y-h]],false)});
    add('shade',1.4,q=>q.ell(x,y-h,w/2-2,7,.05));
    spot('bag',x,y-h,o=>{const s=S(o,42);peekCat(x+o.dir*4,y-h+s*.14,s,o)});
    add('paper',2.2,q=>q.poly([[x-w/2,y-h],[x+w/2,y-h],[x+w/2-6,y],[x-w/2+6,y]],true,.3));
    if(st)add('shade',0,q=>{q.rect(x-w/2+3,y-h*.72,w-6,h*.16,.1);q.rect(x-w/2+5,y-h*.36,w-10,h*.16,.1)});
    else add('none',1.1,q=>q.rect(x-w*.24,y-h*.6,w*.48,h*.36,.2));
    add('paper',1.2,q=>q.ell(x+d*(w/2+16),y-4,12,4,.1));
  }
  // vykopaná díra: kočka vykukuje, přední okraj a hromada písku ji zakrývají
  function hole(x,y){const w=rr(70,86),d=R()<.5?-1:1;
    add('paper',1.8,q=>q.curve([[x-d*w*.5,y-14],[x-d*w*.9,y-44],[x-d*w*1.2,y-40],[x-d*w*1.5,y-10]],true));
    add('shade',1.6,q=>q.ell(x,y-14,w/2,12,.05));
    spot('hole',x,y-10,o=>peekCat(x,y-8,S(o,44),o));
    add('paper',1.8,q=>q.curve([[x-w/2-6,y-14],[x-w*.3,y-4],[x+w*.3,y-4],[x+w/2+6,y-14],[x+w*.3,y+2],[x-w*.3,y+2]],true));
    add('ink',0,q=>{for(let i=0;i<8;i++)q.ell(x-d*w*rr(.7,1.3),y-rr(14,34),1.4,1.4,.2)});
    spade(x+d*(w/2+26),y+4);
  }
  // plážový stan (půlkopule), kočka uvnitř
  function tent(x,y){const w=rr(150,180),h=rr(84,98),d=R()<.5?-1:1,st=R()<.5,cx=x+d*w*.1,dome=[],op=[];
    for(let k=0;k<=12;k++){const t=k/12*Math.PI;dome.push([x-Math.cos(t)*w/2,y-Math.sin(t)*h])}
    for(let k=0;k<=10;k++){const t=k/10*Math.PI;op.push([cx-Math.cos(t)*w*.28,y-Math.sin(t)*h*.8])}
    add('none',1.1,q=>{q.line(x-w/2+6,y-h*.5,x-w/2-34,y+4,.1);q.line(x+w/2-6,y-h*.5,x+w/2+34,y+4,.1)});
    add('paper',2.2,q=>q.poly(dome,true,.4));
    if(st)add('shade',0,q=>{const a=[],b=[];for(let k=0;k<=12;k++){const t=k/12*Math.PI;a.push([x-Math.cos(t)*w*.5,y-Math.sin(t)*h]);b.push([x-Math.cos(t)*w*.42,y-Math.sin(t)*h*.86])}q.poly(a.concat(b.reverse()),true,.2)});
    else add('none',1,q=>{q.curve([[x-w*.2,y],[x-w*.1,y-h*.9],[x+w*.1,y-h*.98]],false);q.curve([[x+w*.3,y],[x+w*.26,y-h*.6],[x+w*.1,y-h*.98]],false)});
    add('shade',1.4,q=>q.poly(op,true,.3));
    spot('tent',cx,y,o=>o.alt?sleepCat(cx,y-2,S(o,46),o):sitCat(cx,y-2,S(o,42),o));
    add('paper',1.4,q=>q.ell(cx,y-h*.8,w*.2,6,.05));
  }
  // šlapadlo na vodě
  function pedalo(x,y){const d=R()<.5?-1:1,sx=x+d*16;
    add('paper',1.1,q=>q.ell(x,y+2,84,8,.05));
    add('paper',1.8,q=>q.rect(x-44,y-50,78,30,.3));
    add('paper',1.8,q=>q.poly([[x-d*32,y-50],[x-d*24,y-84],[x-d*4,y-84],[x-d*8,y-50]],true,.2));
    spot('pedalo',sx,y-50,o=>sitCat(sx,y-49,S(o,40),o));
    add('paper',2,q=>q.poly([[x-72,y-20],[x+72,y-20],[x+60,y],[x-60,y]],true,.3));
    add('shade',0,q=>q.rect(x-62,y-14,124,6,.1));
    add('none',1,q=>{for(let k=0;k<3;k++)q.line(x-70+k*10,y+8+k*4,x+60-k*8,y+8+k*4,.2)});
  }
  function signpost(x,y){const d=R()<.5?-1:1;
    add('none',3,q=>q.line(x,y,x,y-150,.2));
    add('paper',2,q=>q.poly([[x-d*44,y-148],[x+d*40,y-148],[x+d*56,y-132],[x+d*40,y-116],[x-d*44,y-116]],true,.3));
    add('none',1.4,q=>{q.line(x-d*32,y-136,x+d*24,y-136,.2);q.line(x-d*32,y-127,x+d*10,y-127,.2)});
    spot('sign',x-d*4,y-148,o=>loafCat(x-d*4,y-147,S(o,36),o));
    add('paper',1.8,q=>q.rect(x-30,y-104,60,40,.3));
    add('none',1.2,q=>{q.ell(x-14,y-86,6,6,.1);q.line(x-2,y-90,x+22,y-90,.2);q.line(x-2,y-80,x+16,y-80,.2)});
  }

  function beach(){
    const objs=[],taken=[];
    // chrání kočky, které nejsou v place() (moře, molo), před zakrytím předměty na pláži
    const guard=(x,y,w=70,h=80)=>taken.push({x,y:y+8,w,h});
    // střet: stejná hloubka a překryv, nebo předmět vpředu zakryje víc než 30 % předmětu vzadu
    const clash=(x,y,w,h)=>{for(let i=0,n=taken.length;i<n;i++){const t=taken[i],dx=t.x-x;if(dx>=(t.w+w)/2+16||-dx>=(t.w+w)/2+16)continue;const dy=y-t.y;if(dy<60&&dy>-60)return true;
      if(dy>0?(t.y-Math.max(y-h,t.y-t.h))/t.h>.3:(y-Math.max(t.y-t.h,y-h))/h>.3)return true}return false};
    const LS=R()<.5?-1:1,LX=LS<0?rr(190,300):W-rr(190,300),LB=rr(805,830);
    const PD=-LS,plen=rr(820,960),xa=PD>0?rr(560,W-140-plen):rr(140+plen,W-560),xb=xa+PD*plen,ya=rr(950,962),yb=rr(795,815);
    const p1=rr(0,6),p2=rr(0,6),shY=x=>1012+10*Math.sin(x/210+p1)+5*Math.sin(x/77+p2);
    const BX0=rr(800,2200),BX1=BX0+rr(-220,220),BYT=rr(1520,1570),bwc=y=>BX1+(BX0-BX1)*(y-BYT)/(H-BYT),bwh=y=>90+60*(y-BYT)/(H-BYT);
    const blocked=(x,y,w)=>y>BYT-30&&Math.abs(x-bwc(Math.max(y,BYT)))<bwh(Math.max(y,BYT))+w/2+10;
    const put=(f,x,y,w,h)=>{if(blocked(x,y,w)||clash(x,y,w,h))return false;taken.push({x,y,w,h});objs.push({f,x,y});return true};
    const tryPut=(f,w,h,y0,y1,x0=80,x1=W-80)=>{for(let i=0;i<14;i++){const x=rr(x0,x1),y=rr(y0,y1);if(put(f,x,y,w,h))return{x,y}}return null};
    // volné úseky vodní hladiny mimo maják a molo
    const lo=Math.min(xa,xb),hi=Math.max(xa,xb),free=(LS<0?[[LX+340,lo-150],[hi+150,W-120]]:[[120,lo-150],[hi+150,LX-340]]).filter(([a,b])=>b-a>80);
    const inFree=()=>{if(!free.length)return null;const[a,b]=pick(free);return rr(a,b)};

    sky();
    farIsland(Math.max(380,Math.min(W-380,LX+LS*rr(-40,120))));
    headland(-LS);
    // moře: vzdálený pás, obzor
    add('shade',0,q=>{const p=[[-10,HZ],[W+10,HZ]];for(let x=W+10;x>=-10;x-=120)p.push([x,HZ+80+rr(-8,8)]);q.poly(p,true,.3)});
    add('none',2,q=>q.line(-10,HZ,W+10,HZ,.6));
    const fx=LS<0?rr(900,W-560):rr(560,W-900);ferry(fx,HZ+rr(40,52),R()<.5?-1:1);
    {const sb=[fx];for(let i=0;i<4;i++){const x=rr(150,W-150);if(Math.abs(x-LX)>220&&sb.every(u=>Math.abs(u-x)>240)){sb.push(x);sailboat(x,HZ+rr(20,90),rr(.42,.62),false)}}}
    add('none',1.1,q=>{for(let i=0;i<340;i++){const y=HZ+96+Math.pow(R(),.8)*(990-HZ-96),s=.5+(y-HZ)/420,x=rr(0,W);q.curve([[x-16*s,y],[x-6*s,y-4*s],[x+4*s,y],[x+16*s,y-4*s]],false)}});
    add('none',1.4,q=>{for(let i=0;i<22;i++){const x=rr(2620,2960),y=HZ+rr(6,70);q.line(x,y,x+rr(14,34),y,.2)}});
    // bližší plachetnice s kočkou, maják na skalách, bóje
    for(const[a,b]of free){if(b-a<140)continue;const x=rr(a+40,b-40),y=rr(690,740);sailboat(x,y,rr(.85,1.05),true);guard(x,y-14,90,60)}
    lighthouse(LX,LB,guard);
    if(free.length){const[a,b]=free[0],y=rr(965,980);add('paper',1,q=>{for(let x=a+20;x<b-20;x+=26)q.ell(x,y+Math.sin(x/90)*4,6,4,.1)});add('none',.9,q=>q.curve([[a+20,y],[(a+b)/2,y+6],[b-20,y]],false))}
    const used=[];const inFreeFar=()=>{for(let i=0;i<8;i++){const x=inFree();if(x!==null&&used.every(u=>Math.abs(u-x)>200)){used.push(x);return x}}return null};
    for(let i=0;i<2;i++){const x=inFreeFar();if(x!==null){const y=rr(930,955);buoy(x,y);guard(x,y-66,60,90)}}
    {const x=inFreeFar();if(x!==null){const y=rr(972,985);pedalo(x,y);guard(x,y-50,70,70)}}
    // molo, uvázaná loďka a drak
    const tb=rr(.66,.82),P=pier(xa,xb,ya,yb,guard,tb);
    {const t=tb,s=P.sc(t),bx=P.X(t)+PD*30,by=P.Y(t)+124*s;
      add('none',1.2,q=>q.curve([[P.X(t),P.Y(t)+30*s],[bx-PD*40,by-30],[bx-PD*70,by-24]],false));
      rowboat(bx,by,150,'rowboat',PD);guard(bx,by-30,90,60);
      add('none',1,q=>{for(let k=0;k<3;k++)q.line(bx-60+k*10,by+5+k*4,bx+50-k*8,by+5+k*4,.2)})}
    {const t=rr(.35,.55),ax=P.X(t),ay=P.Y(t)-80*P.sc(t);let kx=ax+rr(-320,320);if(Math.abs(kx-LX)<280)kx=ax-(kx-ax);kx=Math.max(200,Math.min(2550,kx));kite(kx,rr(230,360),ax,ay)}
    // příboj a písek
    add('paper',1.6,q=>{const a=[],b=[];let i=0;for(let x=-20;x<=W+20;x+=26,i++){a.push([x,shY(x)-22-(i%2?7:0)]);b.push([x,shY(x)+14])}q.curve(a.concat(b.reverse()),true)});
    add('none',1.2,q=>{for(let x=-20;x<W;x+=rr(160,300)){const l=rr(80,180),pts=[];for(let k=0;k<=6;k++){const px=x+l*k/6;pts.push([px,shY(px)-54-(k%2?5:0)])}q.curve(pts,false)}});
    add('paper',2.2,q=>{const p=[];for(let x=-20;x<=W+20;x+=40)p.push([x,shY(x)]);p.push([W+20,H+20],[-20,H+20]);q.poly(p,true,.6)});
    add('shade',0,q=>{const a=[],b=[];for(let x=-20;x<=W+20;x+=40){a.push([x,shY(x)+4]);b.push([x,shY(x)+26+Math.sin(x/130)*6])}q.poly(a.concat(b.reverse()),true,.4)});
    // textura písku: tečky, vlnky od větru, stopy lidí a racků
    add('none',2.4,q=>{for(let i=0;i<640;i++){const x=rr(0,W),y=rr(shY(0)+40,H-10);q.line(x,y,x+.8,y+.3,0)}});
    add('none',1,q=>{for(let i=0;i<100;i++){const x=rr(0,W),y=rr(1080,H-20),l=rr(20,50);q.curve([[x-l,y],[x-l*.4,y-4],[x+l*.2,y+1],[x+l,y-3]],false)}});
    add('none',1.1,q=>{for(let tr=0;tr<2;tr++){let x=bwc(BYT)+rr(-60,60),y=BYT;const tx=rr(300,W-300);let k=0;
      while(y>1060&&k<60){const dx=(tx-x)/Math.max(1,(y-1050)/30),ang=Math.atan2(-30,dx),sd=k%2?1:-1,nx=Math.sin(ang)*9*sd,ny=-Math.cos(ang)*9*sd;
        q.ell(x+nx,y+ny,4,7,.1,ang+1.57);x+=dx;y-=30;k++}}});
    add('none',1,q=>{for(let i=0;i<14;i++){const x=rr(100,W-100),y=shY(x)+rr(40,90);q.line(x,y,x-5,y-8,.1);q.line(x,y,x,y-9,.1);q.line(x,y,x+5,y-8,.1)}});
    // dřevěný chodník přes duny (horní část; spodní se kreslí přes duny)
    const walk=(y0,y1)=>{add('paper',2,q=>q.poly([[bwc(y0)-bwh(y0),y0],[bwc(y0)+bwh(y0),y0],[bwc(y1)+bwh(y1),y1],[bwc(y1)-bwh(y1),y1]],true,.4));
      add('none',1,q=>{for(let y=y0+10;y<y1;y+=12+18*(y-BYT)/(H-BYT))q.line(bwc(y)-bwh(y)+2,y,bwc(y)+bwh(y)-2,y,.3)})};
    walk(BYT,1782);
    {const y=rr(BYT+40,1740),x=bwc(y)+rr(-30,30);spot('walk',x,y,o=>sleepCat(x,y,S(o,46),o))}

    // schody z mola na písek
    {const d=-PD,n=6,sw=24,sh=16,cx=xa+d*n*sw/2,yb2=ya+n*sh;
      objs.push({f:()=>{add('paper',2,q=>q.poly([[xa,ya+10],[xa+d*n*sw,yb2+4],[xa+d*n*sw,yb2+14],[xa,ya+26]],true,.3));
        for(let i=0;i<n;i++){const x0=xa+d*i*sw,x1=x0+d*sw,y0=ya+i*sh;add('paper',1.6,q=>q.poly([[x0,y0-30],[x1,y0-30],[x1,y0+sh],[x0,y0+sh]],true,.2));add('none',1,q=>q.line(x0,y0,x1,y0,.1))}
        add('none',2,q=>{q.line(xa,ya-78,xa+d*n*sw,yb2-62,.2);q.line(xa+d*n*sw,yb2-62,xa+d*n*sw,yb2,.2);q.line(xa,ya-30,xa+d*n*sw,yb2-14,.2)})},x:cx,y:yb2+10});
      taken.push({x:cx,y:yb2+10,w:n*sw+40,h:180})}
    // věž plavčíka, kiosek a řada plážových budek
    // kočky dole u věže a kiosku chrání před zakrytím předměty vpředu
    for(let i=0;i<3;i++){const p=tryPut(kiosk,430,330,1215,1262,340,W-340);if(p){guard(p.x,p.y-8,440,100);break}}
    {const p=tryPut(lifeguard,200,420,1225,1275,200,W-200);if(p)guard(p.x,p.y-8,180,90)}
    const nh=6+Math.floor(R()*3),sp=150,rowW=nh*sp,hy=rr(1188,1206);
    // z několika poloh řady vybere tu, kde se vejde nejvíc budek (molo a kočky u vody nesmí zakrýt)
    {let hx0=0,best=-1;for(let i=0;i<10;i++){const c=rr(160,W-160-rowW);let k=0;for(let j=0;j<nh;j++)if(!clash(c+j*sp,hy,sp-20,230))k++;if(k>best){best=k;hx0=c}}
      for(let i=0;i<nh;i++){const x=hx0+i*sp,y=hy+rr(-6,6),ss=i===0&&R()<.5?-1:i===nh-1&&R()<.5?1:0;
        if(clash(x,y,sp-20,230))continue;taken.push({x,y,w:sp-20,h:230},{x,y,w:100,h:90});if(ss)taken.push({x:x+ss*86,y,w:60,h:90});objs.push({f:(x,y)=>hut(x,y,ss),x,y})}}
    tryPut(vnet,440,180,1300,1390,280,W-280);
    // u vody: skály s tůňkou, loďky, racci, krabi, hvězdice, mušle, chaluhy
    tryPut(rockpool,300,110,1070,1120,LS<0?160:W-760,LS<0?760:W-160);
    for(let i=0;i<3;i++)tryPut(beachBoat,250,100,1070,1160);
    tryPut(castleS,150,110,1070,1170);tryPut(castleM,160,140,1080,1170);tryPut(ring,110,60,1060,1160);
    for(let i=0;i<3;i++)tryPut((x,y)=>gull(x,y,R()<.5?-1:1),40,36,1060,1500);
    for(let i=0;i<2;i++)tryPut(crab,50,30,1060,1300);
    for(let i=0;i<3;i++)tryPut((x,y)=>starfish(x,y-6),40,16,1060,1400);
    for(let i=0;i<5;i++)tryPut(shells,90,16,1060,1750);
    for(let i=0;i<3;i++)tryPut(seaweed,60,20,1050,1110);
    // u chodníku: lavička, koš, rozcestník
    {const y=BYT+rr(30,70),s=R()<.5?-1:1;put(bench,bwc(y)+s*(bwh(y)+140),y,220,110);put(bin,bwc(y)-s*(bwh(y)+50),y+rr(-10,10),60,90);put(signpost,bwc(BYT)-s*(bwh(BYT)+110),BYT-rr(0,20),120,160)}
    // pláž: slunečníky, lehátka, deky, hrady, hračky
    // slunečníky nejdřív: ručník dole a stříška nahoře jako dvě samostatné plochy
    // třetí plocha je pás tyče mezi ručníkem a stříškou – ať tyč nevede přes lehátko nebo kruh s kočkou za ním
    for(let i=0,k=0;i<70&&k<8;i++){const x=rr(120,W-120),y=rr(1400,1760),a={x,y,w:170,h:60},b={x,y:y-190,w:260,h:100},c={x,y:y-40,w:130,h:140};
      if(blocked(x,y,170)||clash(a.x,a.y,a.w,a.h)||clash(b.x,b.y,b.w,b.h)||clash(c.x,c.y,c.w,c.h))continue;taken.push(a,b,c);objs.push({f:umbrellaSet,x,y});k++}
    const KK=[[deckchair,110,120],[deckchair,110,120],[lounger,230,110],[lounger,230,110],
      [picnic,200,90],[castleM,160,140],[castleB,240,190],[castleS,150,110],[bucketToy,120,70],[ring,110,60],[ring,110,60],[windbreak,280,110],[cooler,90,80],[surfs,140,210],[ball,50,45],[bag,100,70],[bag,100,70],[hole,200,60],[hole,200,60],[tent,230,110],[tent,230,110]];
    let n=0;for(let i=0;i<240&&n<46;i++){const[f,w,h]=pick(KK);if(put(f,rr(90,W-90),rr(1300,1760),w,h))n++}
    place(objs);

    // duny v popředí s tuřanem (dunovou trávou) a plůtky
    // hrby dun: návětrná strana pozvolná, závětrná strmější a šrafovaná
    const hm=[];for(let x=-120;x<W-80;){const wl=rr(220,420),wr=rr(220,420);hm.push([x+wl,wl,wr,rr(1770,1870)]);x+=(wl+wr)*rr(.4,.6)}
    hm.sort((a,b)=>a[3]-b[3]);
    const hY=(h,x)=>{const u=x<h[0]?(h[0]-x)/h[1]:(x-h[0])/h[2];if(u>=1)return 1e9;return h[3]+(H+20-h[3])*u*u*(3-2*u)};
    const surf=x=>Math.min(...hm.map(h=>hY(h,x)));
    for(const h of hm){const pts=[];for(let k=0;k<=24;k++){const x=h[0]-h[1]+(h[1]+h[2])*k/24;pts.push([x,Math.min(hY(h,x),H+20)])}
      add('paper',2,q=>q.poly(pts,true,.6));
      const sd=h[1]>h[2]?1:-1,ws=sd>0?h[2]:h[1],lee=[];for(let k=0;k<=8;k++){const x=h[0]+sd*ws*(.04+k*.07);lee.push([x,hY(h,x)+3])}for(let k=8;k>=0;k--){const x=h[0]+sd*ws*(.04+k*.07);lee.push([x,hY(h,x)+34+k*4])}
      if(lee.some(p=>p[0]>0&&p[0]<W))add('shade',0,q=>q.poly(lee,true,.3));
      add('none',1,q=>{for(let k=0;k<3;k++){const x=Math.max(40,Math.min(W-40,h[0]+rr(-.6,.6)*(h[1]+h[2])/2)),y=Math.min(H-20,hY(h,x)+rr(30,90));q.curve([[x-30,y],[x,y-5],[x+30,y]],false)}})}
    const inWalk=(x,y,m)=>Math.abs(x-bwc(y))<bwh(y)+m;
    // plůtky z latěk na hřebenech dun: poloha se vybere předem, ať v trsech trávy za nimi nesedí kočka
    const fs=[];for(let f=0;f<10&&fs.length<2;f++){const x0=rr(60,W-300),x1=x0+rr(150,230);let lo=1e9,hi=-1e9,bad=fs.some(([a,b])=>x1>a-60&&x0<b+60);
      for(let x=x0;x<=x1&&!bad;x+=20){const y=surf(x);lo=Math.min(lo,y);hi=Math.max(hi,y);if(inWalk(x,y,30)||y>H-60)bad=true}
      if(bad||hi-lo>46)continue;
      const cx=Math.min(x1-25,x0+45+90*Math.floor(rr(.25,.75)*(x1-x0)/90));let top=1e9;for(let x=cx-30;x<=cx+30;x+=5)top=Math.min(top,surf(x)-44);
      fs.push([x0,x1,cx,top])}
    // tráva na hřebenech dun (kočky schované v trsech)
    for(let x=rr(60,140);x<W-40;x+=rr(160,240)){const y=surf(x)+8;if(y>H-40||inWalk(x,y,60))continue;const cat=R()<.8,bl=[];
      for(let i=0;i<13;i++){const bx=x+rr(-50,50),hh=rr(45,90),ln=rr(-22,22);bl.push([bx,surf(bx)+8,hh,ln])}
      // kočka vykukuje z trsu: brada kousek pod hřebenem, stébla přes ni jen řídce
      const px=x+(R()<.5?-1:1)*20,py=surf(px)+2;if(cat&&py<H-50&&!inWalk(px,py,50)&&!fs.some(([a,b])=>px>a-50&&px<b+50))spot('dune',px,py-30,o=>peekCat(px,py-4,S(o,46),o));
      add('none',1.4,q=>{for(const[bx,by,hh,ln]of bl)q.curve([[bx,by],[bx+ln*.3,by-hh*.55],[bx+ln,by-hh]],false)})}
    for(const[x0,x1,cx,top]of fs){
      // kočka sedí za plotem mezi sloupky, hlava nad horní hranou latěk
      spot('fence',cx,top,o=>{const s=S(o,46);sitCat(cx,top+s*.7,s,o)});
      add('paper',1.2,q=>{for(let x=x0;x<x1;x+=15){const y=surf(x)+14;q.rect(x,y-58,8,58,.2)}});
      add('none',1.6,q=>{const a=[],b=[];for(let x=x0;x<=x1;x+=30){a.push([x,surf(x)-30]);b.push([x,surf(x)-2])}q.poly(a,false,.3);q.poly(b,false,.3);for(let x=x0;x<=x1;x+=90)q.line(x,surf(x)+18,x,surf(x)-60,.2)})}
    // spodní část chodníku přes duny, provazové zábradlí
    walk(1782,H+10);
    {const y=rr(1850,1950),x=bwc(y)+rr(-.4,.4)*bwh(y);spot('walk',x,y,o=>o.alt?sitCat(x,y,S(o,50),o):loafCat(x,y,S(o,46),o))}
    add('none',2.6,q=>{for(const s of[-1,1])for(let y=1800;y<H;y+=62)q.line(bwc(y)+s*(bwh(y)+10),y,bwc(y)+s*(bwh(y)+10),y-60,.2)});
    add('none',1.2,q=>{for(const s of[-1,1]){const pts=[];for(let y=1800;y<H;y+=31){const top=(y-1800)%62===0;pts.push([bwc(y)+s*(bwh(y)+10),y-(top?58:44)])}q.curve(pts,false)}});
  }

  beach();
}});
