// Kavárna ve starém domě: trámový strop s lampami, výloha do ulice, dlouhý pult s policemi,
// salonek s obrazy a nábytkem, podlaha v perspektivě a stolky se židlemi.
// Prostředí se registruje přes SCENE(); build(K) dostane sdílené nástroje z jádra (index.html).
SCENE({id:"kavarna",ver:5,name:"Kavárna",where:"za pultem, na policích, pod stolky i v lampách",
  // kolik koček smí mít jeden druh úkrytu (neuvedený druh = 1)
  caps:{lamp:2,lamptop:1,ledge:2,ledgepot:1,sign:1,street:1,across:1,curtain:2,drape:1,display:2,sillplant:1,radiator:1,winbench:1,
    board:1,cshelf:2,jar:1,bag:1,counter:2,ontop:2,vitrine:1,machine:1,basket:1,cookiejar:1,stool:1,
    frametop:2,portrait:1,clock:1,bracket:1,porthole:1,doorway:1,sofa:1,sofaarm:1,sofaseat:1,bookcase:1,bookcasetop:1,
    piano:1,underpiano:1,dresser:1,dressertop:1,umbrella:1,plant:1,papers:1,trolley:1,sacks:1,catbed:1,
    chair:1,undertable:1,cloth:1,armchair:2,table:2,hanger:1,capital:1,crate:1,bike:1,box:1,underchair:1,rack:1,floorlamp:1},
build(K){
  const{R,rr,add,spot,S,reg,head,sitCat,loafCat,sleepCat,peekCat,pick,place,box}=K;
  const FY=1320,CY=150,DP=26,WT=CY+DP+40,LY=372,VY=860;
  let VX=1500;
  // hloubkové měřítko předmětů na podlaze
  const dsc=y=>.94+.36*Math.max(0,y-FY)/(H-FY);
  const LAMPS=[],TAKEN=[];
  const SIGNS=['OTEVŘENO','MENU','KÁVA','ČAJ'];let nSign=0;// cedulky ve výlohách
  // kočka na podlaze v (x, y) nebude zakrytá předmětem, který stojí před ní (větší y)?
  const clearFloor=(x,y,r)=>TAKEN.every(t=>t.y<=y+4||t.y-(t.h>160?250:170)>y||Math.abs(t.x-x)>t.w/2+r);
  // je obdélník volný od stínidel lamp a květináčů?
  const lampFree=(a,b,c,d)=>LAMPS.every(([x,,by,t])=>t<0?(c<x-50||a>x+50||d<by-116||b>by+110):(c<x-64||a>x+64||d<by-64||b>by+22));
  // nevede přes obdélník šňůra lampy nebo provázky makramé? (lampy se kreslí až nakonec, přes kočky)
  const cordFree=(a,b,c,d)=>LAMPS.every(([x,ty,by,t])=>{const r=t<0?42:6;return c<x-r||a>x+r||d<ty||b>(t<0?by+130:by-10)});
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

  /* písmo z tahů pro nápisy (jednotkový box šířka .7, výška 1) */
  const FONT={K:[[[0,0],[0,1]],[[.7,0],[.02,.58]],[[.22,.42],[.72,1]]],A:[[[0,1],[.35,0],[.7,1]],[[.14,.62],[.56,.62]]],
    V:[[[0,0],[.35,1],[.7,0]]],R:[[[0,1],[0,0],[.48,0],[.68,.14],[.68,.34],[.48,.5],[0,.5]],[[.34,.5],[.7,1]]],
    N:[[[0,1],[0,0],[.7,1],[.7,0]]],U:[[[0,0],[0,.78],[.16,1],[.54,1],[.7,.78],[.7,0]]],
    O:[[[.35,0],[.64,.16],[.7,.5],[.64,.84],[.35,1],[.06,.84],[0,.5],[.06,.16],[.35,0]]],
    C:[[[.7,.14],[.5,0],[.2,0],[0,.28],[0,.72],[.2,1],[.5,1],[.7,.86]]],Y:[[[0,0],[.35,.5],[.7,0]],[[.35,.5],[.35,1]]],
    E:[[[.7,0],[0,0],[0,1],[.7,1]],[[0,.5],[.5,.5]]],T:[[[0,0],[.7,0]],[[.35,0],[.35,1]]],J:[[[.7,0],[.7,.8],[.5,1],[.2,1],[0,.8]]],
    M:[[[0,1],[0,0],[.35,.55],[.7,0],[.7,1]]]};
  const ACC={'Á':['A',[[.3,-.12],[.5,-.3]]],'Č':['C',[[.18,-.32],[.35,-.14],[.52,-.32]]],'Ř':['R',[[.14,-.32],[.31,-.14],[.48,-.32]]]};
  const wlen=(s,h)=>{let l=-.25*h;for(const ch of s)l+=ch===' '?.6*h:.95*h;return l};
  function word(q,s,x,y,h){let cx=x;for(const ch of s){if(ch===' '){cx+=h*.6;continue}
    const[b,ex]=ACC[ch]||[ch,null];for(const st of FONT[b])q.poly(st.map(([u,v])=>[cx+u*h,y+v*h]),false,.4);
    if(ex)q.poly(ex.map(([u,v])=>[cx+u*h,y+v*h]),false,.2);cx+=h*.95}}

  // popínavé šlahouny s lístky visící dolů z květináče
  function vines(x,y,n,sp,l0,l1){const vs=[];for(let i=0;i<n;i++){const dx=rr(-sp,sp),len=rr(l0,l1);vs.push([x+dx*.3,y,x+dx,y+len*.5,x+dx*1.25,y+len])}
    add('none',1.1,q=>{for(const v of vs)q.curve([[v[0],v[1]],[v[2],v[3]],[v[4],v[5]]],false)});
    add('paper',1.1,q=>{for(const v of vs)for(let k=1;k<=4;k++){const t=k/4.2,u=1-t,px=u*u*v[0]+2*u*t*v[2]+t*t*v[4],py=u*u*v[1]+2*u*t*v[3]+t*t*v[5];q.ell(px+(k%2?5:-5),py,6.5,3.5,.1,k%2?.6:-.6)}});
  }
  /* drobnosti na stůl a do polic */
  function cup(x,b,k=1){
    add('paper',1.4,q=>q.ell(x,b-2*k,16*k,4*k,.1));
    add('paper',1.6,q=>q.poly([[x-11*k,b-26*k],[x+11*k,b-26*k],[x+8*k,b-4*k],[x-8*k,b-4*k]],true,.3));
    add('none',1.4,q=>q.curve([[x+10*k,b-22*k],[x+19*k,b-18*k],[x+9*k,b-10*k]],false));
  }
  function cupStack(x,b,n){add('paper',1.5,q=>{for(let i=0;i<n;i++){const y=b-i*20;q.poly([[x-14,y-20],[x+14,y-20],[x+10,y],[x-10,y]],true,.3)}});
    add('none',1.2,q=>{for(let i=0;i<n;i++)q.curve([[x+13,b-i*20-16],[x+20,b-i*20-12],[x+12,b-i*20-5]],false)})}
  function jar(x,b,h,lid=true){
    add('paper',1.8,q=>q.rect(x-20,b-h,40,h,.5));
    add('none',1,q=>{for(let i=0;i<4;i++)q.ell(x+rr(-12,12),b-rr(8,h-10),3,3,.2)});
    if(lid)add('paper',1.6,q=>q.rect(x-22,b-h-10,44,10,.3));
  }
  function teapot(x,b,k=1){
    add('paper',2,q=>q.ell(x,b-22*k,24*k,20*k,.04));
    add('none',2,q=>{q.curve([[x+22*k,b-24*k],[x+36*k,b-30*k],[x+42*k,b-42*k]],false);q.curve([[x-22*k,b-32*k],[x-34*k,b-24*k],[x-22*k,b-12*k]],false)});
    add('paper',1.6,q=>{q.ell(x,b-42*k,12*k,5*k,.1);q.ell(x,b-49*k,4*k,4*k,.1)});
  }
  function coffeeBag(x,b){
    add('paper',1.8,q=>q.poly([[x-22,b],[x+22,b],[x+24,b-56],[x+18,b-64],[x-18,b-64],[x-24,b-56]],true,.3));
    add('paper',1.6,q=>q.rect(x-20,b-76,40,13,.3));
    add('none',1,q=>{q.rect(x-13,b-44,26,24,.2);q.ell(x,b-32,5,7,.1);q.line(x-2,b-38,x+2,b-26,.1)});
  }
  function bottles(x,b){add('paper',1.6,q=>{for(const[dx,h]of[[0,rr(70,86)],[22,rr(62,80)]])q.poly([[x+dx-9,b],[x+dx+9,b],[x+dx+9,b-h*.62],[x+dx+4,b-h*.78],[x+dx+4,b-h],[x+dx-4,b-h],[x+dx-4,b-h*.78],[x+dx-9,b-h*.62]],true,.2)});
    add('none',1,q=>{q.rect(x-7,b-38,14,16,.1);q.rect(x+15,b-34,14,14,.1)})}
  function glasses(x,b){add('paper',1.4,q=>{for(let i=0;i<3;i++){const gx=x+10+i*18;q.poly([[gx-7,b],[gx+7,b],[gx+9,b-30],[gx-9,b-30]],true,.2)}});
    add('none',.9,q=>{for(let i=0;i<3;i++)q.line(x+6+i*18,b-24,x+5+i*18,b-8,.1)})}
  function shelfPlant(x,b){
    add('paper',1.2,q=>{for(let i=0;i<7;i++){const a=rr(.4,2.7),l=rr(18,34);q.ell(x+Math.cos(a)*l,b-28-Math.sin(a)*l*.8,9,5,.1,-a)}});
    vines(x,b,3,18,50,80);
    add('paper',1.8,q=>q.poly([[x-16,b-28],[x+16,b-28],[x+12,b],[x-12,b]],true,.3));
  }
  function cake(x,b){
    add('none',2,q=>{q.line(x,b,x,b-24,.2);q.line(x-20,b,x+20,b,.2)});
    add('paper',1.8,q=>q.ell(x,b-26,52,8,.05));
    add('paper',2,q=>q.rect(x-34,b-70,68,42,.5));
    add('none',1.2,q=>q.curve([[x-34,b-56],[x-17,b-50],[x,b-56],[x+17,b-50],[x+34,b-56]],false));
    add('none',1.8,q=>q.curve([[x-48,b-28],[x-46,b-100],[x,b-116],[x+46,b-100],[x+48,b-28]],false));
    add('ink',0,q=>q.ell(x,b-120,5,5,.1));
  }
  function slices(x,b,n){add('paper',1.4,q=>{for(let i=0;i<n;i++){const sx=x+i*30;q.poly([[sx-12,b],[sx+14,b],[sx+14,b-20],[sx-12,b-12]],true,.2)}});
    add('none',1,q=>{for(let i=0;i<n;i++){const sx=x+i*30;q.line(sx-12,b-6,sx+14,b-10,.1)}})}
  function roundCake(x,b,w){add('paper',1.6,q=>{q.rect(x-w/2,b-26,w,26,.3);q.ell(x,b-26,w/2,5,.05)});
    add('none',1,q=>{q.curve([[x-w/2,b-18],[x-w/4,b-12],[x,b-18],[x+w/4,b-12],[x+w/2,b-18]],false)});
    add('ink',0,q=>{for(let i=-1;i<=1;i++)q.ell(x+i*w*.25,b-31,3,3,.1)})}

  /* strop s trámy v perspektivě */
  function kCeiling(){const vy=900,bs=rr(260,320),bw=38,B=CY+DP,X=(xb,y,b)=>VX+(xb-VX)*(vy-y)/(vy-b);
    add('none',.9,q=>{for(let xb=-900;xb<=3900;xb+=54){const b=X(xb,0,CY);if(Math.max(xb,b)<-10||Math.min(xb,b)>W+10)continue;q.line(xb,CY,b,0,.3)}});
    const beams=[];for(let xb=rr(20,bs);xb<W+60;xb+=bs)beams.push(xb);
    for(const xb of beams){const l=xb-bw/2,r=xb+bw/2,inn=xb<VX?r:l;
      // bok trámu natočený k úběžníku a spodní plocha
      add('shade',1.4,q=>q.poly([[inn,CY],[inn,B],[X(inn,0,B),0],[X(inn,0,CY),0]],true,.3));
      add('paper',1.8,q=>q.poly([[l,B],[r,B],[X(r,0,B),0],[X(l,0,B),0]],true,.4))}
    add('paper',2,q=>q.rect(-10,CY-4,W+20,DP+16,.6));
    add('none',1.1,q=>{q.line(-10,B+22,W+10,B+22,.5);for(let x=6;x<W;x+=34)q.rect(x,B+24,14,9,.2)});
    add('none',1.6,q=>q.line(-10,WT,W+10,WT,.6));
    return{beams,X:(xb,y)=>X(xb,y,B)};
  }
  // závěsné lampy: mísa (kočka vykukuje), válec (kočka leží nahoře), smaltovaný kužel, koule, žárovka v kleci
  function lamp(x,ty,by,t){
    add('paper',1.3,q=>q.rect(x-8,ty-2,16,7,.1));
    if(t<.36){add('none',1.3,q=>q.line(x,ty+4,x,by-24,.3));
      spot('lamp',x,by-22,o=>peekCat(x,by-20,S(o,40),o));
      add('paper',2,q=>q.curve([[x-56,by-26],[x-48,by+6],[x,by+17],[x+48,by+6],[x+56,by-26]],true));
      add('none',1,q=>{q.curve([[x-50,by-12],[x,by-4],[x+50,by-12]],false);for(let k=-2;k<=2;k++)q.ell(x+k*20,by-3+Math.abs(k)*-3,2.5,2.5,.1)})}
    else if(t<.64){const w=rr(84,100),top=by-58;add('none',1.3,q=>q.line(x,ty+4,x,top,.3));
      add('paper',2,q=>q.poly([[x-w*.4,top],[x+w*.4,top],[x+w/2,by],[x-w/2,by]],true,.4));
      add('none',1,q=>{for(let k=-2;k<=2;k++)q.line(x+k*w*.08,top+5,x+k*w*.1,by-5,.3)});
      add('shade',1.2,q=>q.ell(x,by+2,w/2-5,6,.05));
      spot('lamptop',x,top,o=>loafCat(x,top+1,S(o,34),o))}
    else if(t<.8){add('none',1.3,q=>q.line(x,ty+4,x,by-54,.3));
      add('paper',1.4,q=>q.rect(x-8,by-56,16,14,.2));
      add('paper',2,q=>q.poly([[x-13,by-44],[x+13,by-44],[x+46,by],[x-46,by]],true,.3));
      add('none',1,q=>q.line(x-40,by-6,x+40,by-6,.2));
      add('paper',1.2,q=>q.ell(x,by+7,10,9,.05))}
    else if(t<.92){add('none',1.3,q=>q.line(x,ty+4,x,by-60,.3));
      add('none',1.8,q=>{q.line(x-58,by-60,x+58,by-60,.3);for(const d of[-50,0,50])q.line(x+d,by-60,x+d,by-26-Math.abs(d)*.2,.2)});
      add('paper',1.5,q=>{for(const d of[-50,0,50])q.ell(x+d,by-10-Math.abs(d)*.2,15,15,.03)});
      add('none',.9,q=>{for(const d of[-50,0,50])q.curve([[x+d-7,by-14-Math.abs(d)*.2],[x+d-4,by-19-Math.abs(d)*.2],[x+d+1,by-20-Math.abs(d)*.2]],false)})}
    else{add('none',1.3,q=>q.line(x,ty+4,x,by-34,.3));
      add('paper',1.2,q=>q.ell(x,by-12,13,17,.05));
      add('none',1.1,q=>{q.rect(x-6,by-40,12,8,.1);for(const d of[-1,0,1])q.curve([[x+d*6,by-32],[x+d*20,by-14],[x+d*6,by+6]],false);q.ell(x,by-14,19,4,.05)})}
  }

  /* stěna */
  function wallpaper(){const y0=WT+4,y1=FY-280,t=R();
    if(t<.34){add('none',.9,q=>{for(let x=20;x<W;x+=76){q.line(x,y0,x,y1,.4);q.line(x+8,y0,x+8,y1,.4)}});
      add('none',.8,q=>{for(let x=52;x<W;x+=76)for(let y=y0+18;y<y1-6;y+=40)q.line(x,y,x+2,y+4,.2)})}
    else if(t<.67)add('none',.9,q=>{let r=0;for(let y=y0+30;y<y1-10;y+=72,r++)for(let x=(r%2)*46+20;x<W;x+=92)q.poly([[x,y-12],[x+8,y],[x,y+12],[x-8,y]],true,.2)});
    else add('none',.9,q=>{let r=0;for(let y=y0+36;y<y1-12;y+=72,r++)for(let x=(r%2)*45+22;x<W;x+=90){
      q.curve([[x,y+10],[x+2,y],[x,y-10]],false);q.curve([[x+1,y-2],[x+8,y-8],[x+10,y-3]],false);q.curve([[x,y+4],[x-8,y-2],[x-10,y+3]],false)}});
  }
  function wainscot(){const T=FY-280;
    add('none',1,q=>{for(let x=24;x<W;x+=150)q.rect(x,T+40,118,FY-T-84,.5)});
    add('paper',2,q=>q.rect(-10,T,W+20,16,.5));
    add('paper',1.8,q=>q.rect(-10,FY-28,W+20,28,.4));
  }
  function pilaster(cx,cat){const w=56;
    add('paper',2.2,q=>q.rect(cx-w/2,WT+30,w,FY-WT-60,.5));
    add('none',1,q=>{for(let k=-1;k<=1;k++)q.line(cx+k*13,WT+62,cx+k*13,FY-66,.4)});
    add('paper',2,q=>{q.rect(cx-w/2-10,WT+8,w+20,24,.4);q.rect(cx-w/2-8,FY-64,w+16,36,.4)});
    add('none',1.2,q=>{for(const d of[-1,1])q.curve([[cx+d*(w/2+8),WT+30],[cx+d*(w/2+16),WT+22],[cx+d*(w/2+6),WT+14]],false)});
    // nástěnná lampička na pilastru, kočka sedí na hlavici
    const ly=WT+rr(300,420);
    add('none',2,q=>q.curve([[cx,ly+40],[cx+2,ly+14],[cx,ly]],false));
    add('paper',1.8,q=>{q.rect(cx-10,ly+36,20,16,.2);q.poly([[cx-12,ly-2],[cx+12,ly-2],[cx+22,ly-34],[cx-22,ly-34]],true,.2)});
    if(cat&&cordFree(cx-34,WT-60,cx+34,WT+8)&&lampFree(cx-34,WT-60,cx+34,WT+8))spot('capital',cx,WT+8,o=>sitCat(cx,WT+9,S(o,42),o));
  }
  // závěsný květináč v makramé: kočka vykukuje z květináče
  function hanger(x,ty,by){
    add('none',1.2,q=>{q.line(x,ty+4,x,by-110,.3);for(const d of[-1,0,1])q.line(x,by-110,x+d*30,by-40,.2);q.ell(x,by-110,5,5,.1)});
    add('none',1,q=>{for(const d of[-1,0,1])for(let k=1;k<4;k++)q.ell(x+d*30*(k/4),by-110+70*k/4,2.5,2.5,.1)});
    add('paper',1.2,q=>{for(let i=0;i<6;i++){const a=rr(.4,2.7),l=rr(24,40);q.ell(x+Math.cos(a)*l*.7,by-44-Math.sin(a)*l*.6,14,5,.08,-a)}});
    spot('hanger',x,by-40,o=>peekCat(x+o.dir*3,by-36,S(o,30),o));
    add('paper',2,q=>q.curve([[x-34,by-42],[x-30,by-8],[x,by+4],[x+30,by-8],[x+34,by-42]],true));
    add('none',1,q=>{for(const d of[-1,0,1])q.line(x+d*30,by-40,x+d*12,by+2,.2)});
    vines(x,by-10,3,30,70,120);
  }
  // bedýnky s lahvemi mléka od dodavatele
  function crates(x,y){const k=dsc(y),w=110*k,h=56*k,d=R()<.5?-1:1,tx=x+d*12;
    add('paper',2,q=>q.rect(x-w/2,y-h,w,h,.3));
    add('none',1,q=>{q.line(x-w/2,y-h/2,x+w/2,y-h/2,.2);q.rect(x-18*k,y-h+10,36*k,12*k,.1)});
    add('paper',1.4,q=>{for(let i=0;i<4;i++){const bx=x-w/2+16*k+i*26*k;q.poly([[bx-9*k,y-h],[bx+9*k,y-h],[bx+9*k,y-h-30*k],[bx+4*k,y-h-42*k],[bx-4*k,y-h-42*k],[bx-9*k,y-h-30*k]],true,.2)}});
    spot('crate',tx,y-2*h-10,o=>peekCat(tx,y-2*h-2,S(o,42),o));
    add('paper',2,q=>q.rect(x-w/2+d*14,y-2*h-10,w,h,.3));
    add('none',1,q=>{q.line(x-w/2+d*14,y-1.5*h-10,x+w/2+d*14,y-1.5*h-10,.2);q.rect(x+d*14-18*k,y-2*h,36*k,12*k,.1)});
  }
  // podlaha v perspektivě: šachovnice, kosočtverce nebo prkna
  function kFloor(){const D=H+10,dm=(D-VY)/(FY-VY),ZS=820,Zm=(dm-1)*ZS,t=R();
    const P=(X,Z)=>{const d=Math.min(dm,Math.max(.5,1+Z/ZS));return[VX+(X-VX)/d,VY+(D-VY)/d]};
    const vis=p=>p.some(v=>v[0]>-30&&v[0]<W+30);
    if(t<.36){const T=200;
      // obrys tmavých dlaždic zároveň kreslí celou mřížku
      add('shade',.9,q=>{for(let Z=0,r=0;Z<Zm;Z+=T,r++)for(let X=-2600,c=0;X<5600;X+=T,c++){if((r+c)%2)continue;const p=[P(X,Z),P(X+T,Z),P(X+T,Z+T),P(X,Z+T)];if(vis(p))q.poly(p,true,.3)}})}
    else if(t<.68){const T=190;
      add('shade',.9,q=>{for(let Z=0,r=0;Z-T/2<Zm;Z+=T/2,r++){if(r%2)continue;for(let X=-2600;X<5600;X+=T){
        const p=[P(X,Z-T/2),P(X+T/2,Z),P(X,Z+T/2),P(X-T/2,Z)];if(vis(p))q.poly(p,true,.3)}}})}
    else{const pw=104;
      add('shade',0,q=>{for(let X=-2610,c=0;X<5600;X+=pw,c++){if(c%3)continue;const p=[P(X,0),P(X+pw,0),P(X+pw,Zm),P(X,Zm)];if(vis(p))q.poly(p,true,.3)}});
      add('none',.9,q=>{for(let X=-2610;X<=5600;X+=pw){const a=P(X,0),b=P(X,Zm);if(!vis([a,b]))continue;q.line(a[0],Math.min(a[1],H+4),b[0],b[1],.3);
        for(let Z=rr(0,300);Z<Zm-40;Z+=rr(340,600)){const c=P(X,Z),e=P(X+pw,Z);q.line(c[0],c[1],e[0],e[1],.2)}}})}
    add('none',2,q=>q.line(-10,FY,W+10,FY,.6));
  }
  function rug(ax,y0,y1,w){const f=y=>(y-VY)/(y1-VY),xl=(y,i)=>VX+(ax-w/2+i-VX)*f(y),xr=(y,i)=>VX+(ax+w/2-i-VX)*f(y);
    add('paper',2,q=>q.poly([[xl(y0,0),y0],[xr(y0,0),y0],[xr(y1,0),y1],[xl(y1,0),y1]],true,.4));
    add('none',1.2,q=>q.poly([[xl(y0+14,30),y0+14],[xr(y0+14,30),y0+14],[xr(y1-14,30),y1-14],[xl(y1-14,30),y1-14]],true,.3));
    const cy=(y0+y1)/2,cx=(xl(cy,0)+xr(cy,0))/2,rw=(xr(cy,0)-xl(cy,0))*.2;
    add('shade',1.4,q=>q.poly([[cx,y0+26],[cx+rw,cy],[cx,y1-26],[cx-rw,cy]],true,.3));
    add('none',1,q=>{for(let i=1;i<14;i++){const u=i/14;for(const y of[y0,y1]){const x=xl(y,0)+(xr(y,0)-xl(y,0))*u,d=y===y0?-9:9;q.line(x,y,x,y+d,.2)}}});
  }

  /* výloha do ulice */
  // chodec za sklem – perokresba: obrys, kabát šrafovaný, hlava a doplňky papírové
  function person(px,fy,h,t,d){const hy=fy-h*.9,sh=fy-h*.8,hm=fy-h*.36,ax=px+d*h*.16;
    add('none',1.8,q=>{q.line(px-h*.05,hm+4,px-h*.06-d*h*.04,fy,.2);q.line(px+h*.05,hm+4,px+h*.07+d*h*.06,fy,.2);
      q.line(px-h*.06-d*h*.04,fy,px-h*.06-d*h*.04+d*h*.05,fy,.1);q.line(px+h*.07+d*h*.06,fy,px+h*.07+d*h*.06+d*h*.05,fy,.1)});
    add('shade',1.6,q=>q.poly([[px-h*.1,sh],[px+h*.1,sh],[px+h*.15,hm],[px-h*.15,hm]],true,.3));
    add('none',1.2,q=>{q.line(px,sh+h*.02,px+d*h*.01,hm,.2);q.line(px-d*h*.12,sh+h*.04,px-d*h*.14,fy-h*.5,.2);
      q.line(px+d*h*.1,sh+h*.02,ax,fy-h*.52,.2)});
    add('paper',1.4,q=>{q.poly([[px-h*.07,sh-h*.01],[px+h*.07,sh-h*.01],[px+h*.04,sh+h*.05],[px,sh+h*.02],[px-h*.04,sh+h*.05]],true,.2);
      q.ell(px,hy,h*.062,h*.074,.05)});
    add('none',1,q=>q.line(px+d*h*.03,hy-h*.01,px+d*h*.05,hy+h*.02,.1));
    if(t<.4)add('paper',1.4,q=>{q.ell(px,hy-h*.058,h*.11,h*.02,.05);q.rect(px-h*.055,hy-h*.15,h*.11,h*.09,.1)});
    if(t>.7){add('none',1.6,q=>q.line(ax,fy-h*.52,ax,fy-h*1.1,.1));
      add('shade',1.4,q=>q.curve([[ax-h*.3,fy-h*1.04],[ax,fy-h*1.28],[ax+h*.3,fy-h*1.04]],true))}
    else if(t>.5)add('paper',1.4,q=>{q.rect(ax+d*h*.02-h*.06,fy-h*.5,h*.12,h*.14,.1);q.curve([[ax-h*.02,fy-h*.5],[ax+d*h*.02,fy-h*.56],[ax+h*.04,fy-h*.5]],false)});
  }
  function shopWin(x0,x1){const gx0=x0+36,gx1=x1-36,gw=gx1-gx0,gt=352,SY=FY-340,tb=gt+86,SL=SY-214,cur=R()<.55,dw=rr(96,120);
    // štít s nápisem
    const txt=pick(['KAVÁRNA','U KOČKY','KAVÁRNA','KÁVA A ČAJ']),lh=44,tw=wlen(txt,lh),sw=Math.max(tw+100,gw*.5),
      sx=(x0+x1)/2+rr(-.5,.5)*(gw-sw)*.8,sy0=238,sh=82,ssx=sx+rr(-.4,.4)*sw;
    // kočka vykukuje zpoza štítu
    if(cordFree(ssx-24,sy0-40,ssx+24,sy0+10))spot('sign',ssx,sy0,o=>peekCat(ssx,sy0+8,S(o,42),o));
    add('paper',2.4,q=>q.rect(sx-sw/2,sy0,sw,sh,.6));
    add('none',1,q=>q.rect(sx-sw/2+8,sy0+8,sw-16,sh-16,.4));
    add('none',2.4,q=>word(q,txt,sx-tw/2,sy0+(sh-lh)/2+2,lh));
    // rám a ulice za sklem
    add('paper',2.6,q=>q.rect(gx0-16,gt-16,gw+32,SY-gt+16,.6));
    const hs=[];for(let hx=gx0-rr(20,120);hx<gx1;){const w=rr(200,320);hs.push([hx,w,rr(tb+70,tb+170)]);hx+=w}
    const wins=[];
    for(const[hx,w,ht]of hs){const a=Math.max(hx,gx0+2),b=Math.min(hx+w,gx1-2);if(b-a<24)continue;
      add('paper',1.3,q=>{q.rect(a,ht,b-a,SL-ht,.4);q.line(a,ht+12,b,ht+12,.3)});
      const ws=[];for(let yy=ht+34;yy<SL-110;yy+=96)for(let xx=hx+26;xx<hx+w-60;xx+=74)if(xx>a+4&&xx+38<b-4)ws.push([xx,yy]);
      if(ws.length){add('shade',1,q=>{for(const[xx,yy]of ws)q.rect(xx,yy,38,58,.3)});
      add('none',1,q=>{for(const[xx,yy]of ws)q.line(xx-4,yy+60,xx+42,yy+60,.2)})}
      for(const v of ws)wins.push(v);
      const dx=hx+w*rr(.3,.6);if(dx>a+10&&dx+40<b-10)add('shade',1,q=>q.rect(dx,SL-80,40,80,.3))}
    // volná místa za sklem: ne za příčlí, závěsem, lampou ani chodcem
    const m1=gx0+gw/3,m2=gx0+gw*2/3,dl=cur?gx0+10:gx0-24+dw+10,dr=cur?gx1-10:gx1+24-dw-10;
    const free=(x,r,avoid)=>Math.abs(x-m1)>r+8&&Math.abs(x-m2)>r+8&&x>dl+r&&x<dr-r&&avoid.every(v=>Math.abs(x-v)>r+50);
    const lx=gx0+rr(.15,.85)*gw,np=1+Math.floor(R()*2),ppl=[];
    for(let i=0;i<np;i++){const px=gx0+rr(.08,.92)*gw;if(px>gx0+30&&px<gx1-30&&ppl.every(p=>Math.abs(p[0]-px)>90))ppl.push([px,rr(210,250),R(),R()<.5?-1:1])}
    const pxs=ppl.map(p=>p[0]);
    const aw=wins.filter(([wx,wy])=>free(wx+19,18,pxs.concat([lx]))&&lampFree(wx-6,wy+20,wx+44,wy+60)&&cordFree(wx+2,wy+30,wx+36,wy+60));
    let acx0=-999,acy0=0;
    if(aw.length){const[wx,wy]=pick(aw),acx=wx+19,acy=wy+58;acx0=acx;acy0=acy;
      spot('across',acx,acy,o=>peekCat(acx,acy+1,S(o,26),o));
      add('paper',1,q=>q.rect(wx-5,wy+57,48,6,.2))}
    add('none',2.6,q=>{q.line(lx,SL+30,lx,tb+120,.3);q.curve([[lx,tb+120],[lx+10,tb+100],[lx+26,tb+104]],false)});
    add('paper',1.6,q=>q.poly([[lx+14,tb+104],[lx+38,tb+104],[lx+34,tb+136],[lx+18,tb+136]],true,.2));
    add('none',1.2,q=>{q.line(gx0+2,SL,gx1-2,SL,.4);q.line(gx0+2,SL+40,gx1-2,SL+40,.4)});
    let stx=-999;for(let i=0;i<8;i++){const x=gx0+rr(.1,.9)*gw;if(free(x,24,pxs.concat([lx]))){stx=x;break}}
    if(stx>0&&cordFree(stx-24,SL-50,stx+24,SL))spot('street',stx,SL+4,o=>sitCat(stx,SL+4,S(o,34),o));
    // kolo opřené o dům, kočka v košíku
    let bx=-999;for(let i=0;i<8;i++){const x=gx0+rr(.15,.85)*gw;if(free(x+46,20,pxs.concat([lx,stx]))&&Math.abs(x-stx)>150&&Math.abs(x-lx)>70&&x>gx0+70&&x<gx1-80&&(Math.abs(x-acx0)>100||acy0<SL-150)){bx=x;break}}
    if(bx>0){const fx=bx+46;
      add('none',1.6,q=>{q.ell(bx-44,SL-30,30,30,.03);q.ell(bx+44,SL-30,30,30,.03);
        q.poly([[bx-44,SL-30],[bx-8,SL-30],[bx+30,SL-78],[bx-20,SL-78],[bx-44,SL-30]],false,.2);q.line(bx-8,SL-30,bx-24,SL-90,.2);q.line(bx+44,SL-30,bx+30,SL-96,.2);
        q.line(bx-34,SL-92,bx-14,SL-92,.2);q.curve([[bx+30,SL-96],[bx+22,SL-104],[bx+14,SL-100]],false)});
      if(cordFree(fx-18,SL-120,fx+18,SL-84))spot('bike',fx,SL-90,o=>peekCat(fx,SL-84,S(o,34),o));
      add('paper',1.6,q=>q.rect(fx-20,SL-92,40,24,.2));add('none',.9,q=>{for(let k=-1;k<=1;k++)q.line(fx+k*10,SL-90,fx+k*10,SL-70,.1)})}
    for(const[px,h,t,d]of ppl)if(Math.abs(px-stx)>70&&Math.abs(px-bx-46)>90)person(px,SL+60,h,t,d);
    // markýza venku nad oknem (zespodu)
    const ns=Math.max(4,Math.round(gw/48)),sw2=gw/ns;
    add('paper',1.6,q=>{const p=[[gx0,tb+6],[gx1,tb+6]];for(let i=ns-1;i>=0;i--){const c=gx0+(i+.5)*sw2;p.push([c+sw2/2,tb+38],[c+sw2*.3,tb+50],[c,tb+54],[c-sw2*.3,tb+50])}p.push([gx0,tb+38]);q.poly(p,true,.3)});
    add('shade',0,q=>{for(let i=0;i<ns;i+=2)q.rect(gx0+i*sw2,tb+6,sw2,32,.2)});
    add('none',1,q=>{for(let k=0;k<3;k++){q.line(gx0+20+k*14,SL-40-k*10,gx0+60+k*14,SL-100-k*10,.3);q.line(gx1-120+k*14,tb+150-k*6,gx1-80+k*14,tb+100-k*6,.3)}});
    // příčle
    add('paper',2,q=>{q.rect(gx0,tb-7,gw,14,.3);for(const f of[1/3,2/3])q.rect(gx0+gw*f-7,tb+7,14,SY-tb-7,.3)});
    add('none',1.4,q=>{for(let k=1;k<6;k++)q.line(gx0+gw*k/6,gt,gx0+gw*k/6,tb-7,.2)});
    // parapet výlohy
    add('paper',2.2,q=>q.rect(gx0-40,SY,gw+80,24,.5));
    add('none',1.4,q=>{q.line(gx0-30,SY+24,gx0-10,SY+44,.2);q.line(gx1+30,SY+24,gx1+10,SY+44,.2)});
    let ia=gx0+10,ib=gx1-10;
    if(cur){// záclonka do půlky okna
      const rodY=SL+16;
      for(let k=0;k<3;k++){const cx=gx0+gw*(k+.5)/3+rr(-.2,.2)*gw/3;spot('curtain',cx,rodY,o=>peekCat(cx,rodY+10,S(o,46),o))}
      add('paper',1.6,q=>{const p=[];for(let xx=gx0;xx<=gx1;xx+=16)p.push([xx,rodY+(Math.round((xx-gx0)/16)%2?5:0)]);p.push([gx1,SY-1],[gx0,SY-1]);q.poly(p,true,.3)});
      add('none',1,q=>{for(let xx=gx0+24;xx<gx1-10;xx+=32)q.curve([[xx,rodY+10],[xx+3,rodY+90],[xx-2,SY-6]],false);
        for(let xx=gx0+10;xx<gx1-6;xx+=22)q.ell(xx,rodY+26,3,3,.1)});
      add('none',2.4,q=>q.line(gx0-12,rodY,gx1+12,rodY,.2));
      add('paper',1.4,q=>{q.ell(gx0-14,rodY,6,6,.1);q.ell(gx1+14,rodY,6,6,.1)})}
    else{// závěsy po stranách, stažené šňůrou
      const ty=SY-rr(180,230),dsx=[gx0-24+dw*.72-10,gx1+24-dw*.72+10];
      for(let i=0;i<2;i++){const px=dsx[i];spot('drape',px,SY,o=>sitCat(px,SY+1,S(o,44),o))}
      for(const[e,d]of[[gx0-24,1],[gx1+24,-1]]){
        add('paper',2,q=>q.curve([[e,gt-10],[e+d*dw,gt-10],[e+d*dw*.3,ty],[e+d*dw*.72,SY-2],[e,SY-2]],true));
        add('none',1,q=>{for(let k=1;k<4;k++)q.curve([[e+d*dw*k/4,gt],[e+d*dw*k/10,ty],[e+d*dw*k/5.5,SY-8]],false)});
        add('paper',1.6,q=>q.ell(e+d*dw*.32,ty,14,9,.1))}
      add('paper',2.2,q=>{const p=[[gx0-40,gt-40],[gx1+40,gt-40],[gx1+40,gt+14]];for(let xx=gx1+40;xx>gx0-40;xx-=56)p.push([xx-28,gt+30],[xx-56,gt+14]);q.poly(p,true,.3)});
      ia=gx0+dw*.7+30;ib=gx1-dw*.7-30}
    // věci ve výloze
    for(let ix=ia;ix<ib-60;){const u=R();
      if(u<.26&&ix+100<ib){const gx=ix+48;spot('display',gx,SY,o=>loafCat(gx,SY,S(o,40),o));ix+=104}
      else if(u<.38&&ix+130<ib){cake(ix+62,SY);ix+=rr(128,140)}
      else if(u<.56&&ix+80<ib){const px=ix+36,ph=rr(40,50);
        add('paper',1.2,q=>{for(let i=0;i<7;i++){const a=rr(.3,2.8),l=rr(26,46);q.ell(px+Math.cos(a)*l*.6,SY-ph-Math.sin(a)*l*.7,16,6,.08,-a)}});
        spot('sillplant',px,SY-ph,o=>peekCat(px+o.dir*4,SY-ph+7,S(o,40),o));
        add('paper',2,q=>q.poly([[px-26,SY-ph],[px+26,SY-ph],[px+20,SY],[px-20,SY]],true,.3));ix+=rr(84,96)}
      else if(u<.7&&ix+70<ib){const tx=ix+32;add('paper',1.6,q=>{q.rect(tx-24,SY-44,48,44,.3);q.rect(tx-18,SY-80,36,36,.3);q.ell(tx,SY-80,18,4,.1)});
        add('none',1,q=>{q.rect(tx-16,SY-32,32,16,.1);q.line(tx-10,SY-64,tx+10,SY-64,.1)});ix+=rr(74,84)}
      else if(u<.82&&ix+124<ib){const ox=ix+60;add('none',1.8,q=>{q.line(ox-40,SY,ox-30,SY-70,.2);q.line(ox+40,SY,ox+30,SY-70,.2)});
        const t=SIGNS[nSign++%SIGNS.length];// „OTEVŘENO“ jen jednou, další cedulky jiný nápis
        add('paper',1.8,q=>q.rect(ox-54,SY-84,108,40,.3));add('none',1.4,q=>word(q,t,ox-wlen(t,14)/2,SY-72,14));ix+=rr(124,134)}
      else ix+=rr(30,60)}
    // pod oknem radiátor nebo lavice
    const cx=(x0+x1)/2+rr(-.1,.1)*gw;
    if(R()<.5){const w=gw*rr(.4,.5),top=FY-236,n=Math.floor(w/24),rx0=cx-n*12,rsx=cx+rr(-.3,.3)*w;
      add('none',2.4,q=>{q.line(rx0-4,top+60,rx0-26,top+60,.2);q.line(rx0-26,top+60,rx0-26,FY,.2)});
      // kočka za radiátorem (mezi ním a zdí)
      spot('radiator',rsx,top,o=>peekCat(rsx,top+9,S(o,40),o));
      add('paper',1.8,q=>{for(let i=0;i<n;i++){const x=rx0+i*24;q.poly([[x+2,FY-30],[x+2,top+12],[x+6,top],[x+18,top],[x+22,top+12],[x+22,FY-30]],true,.2)}});
      add('none',1,q=>{for(let i=0;i<n;i++){const x=rx0+i*24+12;q.line(x,top+22,x,FY-44,.2)}});
      add('paper',1.8,q=>{q.rect(rx0+6,FY-30,12,30,.2);q.rect(rx0+n*24-18,FY-30,12,30,.2)})}
    else{const w=gw*rr(.6,.75),sy=FY-120,bsx=cx+rr(-.3,.3)*w;
      add('paper',2.2,q=>q.rect(cx-w/2,sy,w,120,.5));
      add('none',1,q=>{for(let x=cx-w/2+16;x<cx+w/2-60;x+=w/3)q.rect(x,sy+20,w/3-24,80,.3)});
      add('paper',2,q=>q.poly([[cx-w/2+6,sy-20],[cx-w/2+60,sy-6],[cx-w/2+56,sy-80],[cx-w/2+10,sy-90]],true,.5));
      add('paper',2,q=>q.poly([[cx+w/2-6,sy-20],[cx+w/2-60,sy-6],[cx+w/2-56,sy-76],[cx+w/2-8,sy-86]],true,.5));
      add('paper',2,q=>q.rect(cx-w/2-6,sy-24,w+12,26,.8));
      spot('winbench',bsx,sy-24,o=>sleepCat(bsx,sy-23,S(o,46),o))}
    return[gx0,gx1];
  }

  /* pult a zadní stěna s policemi */
  function ledge(x0,x1){const y=LY;
    add('none',1.8,q=>{for(let bx=x0+30;bx<x1-20;bx+=rr(170,240)){q.line(bx,y+14,bx,y+50,.2);q.line(bx,y+50,bx+30,y+14,.2)}});
    add('paper',2,q=>q.rect(x0,y,x1-x0,14,.4));
    for(let ix=x0+16;ix<x1-100;){const u=R();
      if(u<.2){const gx=ix+45;if(cordFree(gx-34,y-66,gx+34,y)&&lampFree(gx-34,y-66,gx+34,y))spot('ledge',gx,y,o=>sitCat(gx,y+1,S(o,40),o));ix+=100}
      else if(u<.33){const px=ix+32;add('paper',1.6,q=>{q.ell(px,y-32,28,30,.03)});add('none',1,q=>{q.ell(px,y-32,18,20,.03);for(let k=0;k<8;k++){const a=k/8*6.283;q.ell(px+Math.cos(a)*23,y-32+Math.sin(a)*25,2,2,.1)}});ix+=rr(64,72)}
      else if(u<.45){teapot(ix+40,y);ix+=rr(84,92)}
      else if(u<.57){const jx=ix+24;add('paper',1.8,q=>q.poly([[jx-16,y],[jx+16,y],[jx+18,y-40],[jx+10,y-56],[jx-12,y-56],[jx-18,y-40]],true,.3));
        add('none',1.6,q=>q.curve([[jx+17,y-44],[jx+30,y-38],[jx+16,y-14]],false));ix+=rr(52,60)}
      else if(u<.69){const tx=ix+24;add('paper',1.6,q=>{q.rect(tx-20,y-60,40,60,.3);q.rect(tx-22,y-68,44,8,.2)});add('none',1,q=>{q.rect(tx-14,y-44,28,22,.1)});ix+=rr(52,60)}
      else if(u<.78){const px=ix+32;shelfPlant(px,y);ix+=rr(70,78)}
      else if(u<.86){const bx=ix+10;add('paper',1.4,q=>{for(let i=0;i<4;i++)q.rect(bx+rr(-3,3),y-12-i*12,64-i*6,12,.2)});ix+=rr(80,90)}
      else if(u<.92){const rx=ix+50;add('paper',2,q=>q.curve([[rx-44,y],[rx-44,y-44],[rx-30,y-62],[rx+30,y-62],[rx+44,y-44],[rx+44,y]],true));
        add('none',1,q=>{q.ell(rx+22,y-30,10,10,.05);for(let k=0;k<4;k++)q.line(rx-34,y-44+k*9,rx+4,y-44+k*9,.2)});ix+=rr(100,110)}
      else if(u<.96){const px=ix+34;if(cordFree(px-24,y-76,px+24,y-40))spot('ledgepot',px,y-40,o=>peekCat(px+o.dir*4,y-34,S(o,40),o));
        add('paper',2,q=>q.poly([[px-26,y-40],[px+26,y-40],[px+20,y],[px-20,y]],true,.3));
        vines(px,y-4,4,24,90,150);
        ix+=rr(76,84)}
      else ix+=rr(30,50)}
  }
  function shelfRow(x0,x1,sy){
    add('none',1.6,q=>{q.line(x0+20,sy+12,x0+36,sy+40,.2);q.line(x1-20,sy+12,x1-36,sy+40,.2)});
    for(let ix=x0+10;ix<x1-110;){const u=R();
      if(u<.08){const gx=ix+48;spot('cshelf',gx,sy,o=>loafCat(gx,sy,S(o,38),o));ix+=100}
      else if(u<.28){cupStack(ix+18,sy,1+Math.floor(R()*3));ix+=rr(40,50)}
      else if(u<.44){const jh=rr(46,70),jx=ix+22,c=R()<.3;if(c)spot('jar',jx,sy,o=>peekCat(jx,sy-jh+7,S(o,26),o));jar(jx,sy,jh,!c);ix+=rr(52,62)}
      else if(u<.58){const bx=ix+26;if(R()<.35)spot('bag',bx,sy-70,o=>peekCat(bx+o.dir*4,sy-66,S(o,40),o));coffeeBag(bx,sy);ix+=rr(56,66)}
      else if(u<.68){teapot(ix+36,sy);ix+=rr(80,90)}
      else if(u<.8){bottles(ix+10,sy);ix+=rr(46,60)}
      else if(u<.88){glasses(ix,sy);ix+=rr(62,70)}
      else if(u<.94){shelfPlant(ix+30,sy);ix+=rr(64,74)}
      else ix+=rr(20,40)}
    add('paper',2,q=>q.rect(x0,sy,x1-x0,12,.5));
  }
  function board(x,top,w,h,menu){
    add('paper',2.4,q=>q.rect(x-w/2-12,top-12,w+24,h+24,.5));
    add('shade',1.4,q=>q.rect(x-w/2,top,w,h,.4));
    add('none',1.3,q=>{let y=top+22;if(menu){word(q,'MENU',x-wlen('MENU',26)/2,top+14,26);y=top+62}
      for(;y<top+h-16;y+=26){q.line(x-w/2+16,y,x-w/2+16+rr(.3,.55)*w,y,.8);q.line(x+w/2-50,y,x+w/2-18,y,.5)}},'paper');
    add('none',1.2,q=>{const cx=x+w*.3,cy=top+h*.3;q.poly([[cx-14,cy-12],[cx+14,cy-12],[cx+10,cy+10],[cx-10,cy+10]],true,.3);q.curve([[cx-4,cy-18],[cx,cy-26],[cx-3,cy-34]],false)},'paper');
    const bx=x+rr(-.35,.35)*w;if(lampFree(bx-30,top-80,bx+30,top-12)&&cordFree(bx-30,top-80,bx+30,top-12))spot('board',bx,top-12,o=>sitCat(bx,top-11,S(o,44),o));
  }
  function machine(x,b,v){
    if(v<.4){
      add('paper',2.2,q=>q.rect(x-80,b-150,160,130,.6));
      add('paper',2,q=>q.rect(x-88,b-162,176,14,.4));
      add('paper',1.8,q=>q.rect(x-84,b-22,168,22,.4));
      add('none',1,q=>{for(let k=-3;k<=3;k++)q.line(x+k*22,b-18,x+k*22,b-4,.2);q.line(x-70,b-128,x+70,b-128,.2)});
      for(const d of[-1,1]){const gx=x+d*40;add('paper',1.6,q=>q.rect(gx-13,b-96,26,18,.2));add('none',3.4,q=>q.line(gx,b-74,gx+d*44,b-70,.1));add('paper',1.4,q=>q.ell(gx,b-74,16,6,.05))}
      add('paper',1.6,q=>q.ell(x,b-118,13,13,.05));add('none',1.2,q=>q.line(x,b-118,x+7,b-124,.1));
      add('none',2.4,q=>q.curve([[x+80,b-110],[x+100,b-100],[x+94,b-48]],false));
      cup(x-60,b-162,.8);cup(x-34,b-162,.8);cup(x-40,b-22,.8);
      spot('machine',x+42,b-162,o=>loafCat(x+42,b-161,S(o,38),o))}
    else if(v<.7){
      add('paper',2.2,q=>q.rect(x-70,b-30,140,30,.4));
      add('paper',2.2,q=>q.rect(x-40,b-126,80,96,.5));
      add('paper',2,q=>q.curve([[x-40,b-126],[x-34,b-146],[x,b-154],[x+34,b-146],[x+40,b-126]],true));
      add('paper',1.6,q=>{q.ell(x,b-160,8,8,.05);q.poly([[x-14,b-164],[x,b-174],[x+14,b-164],[x,b-160]],true,.2)});
      add('none',1,q=>{for(let k=0;k<2;k++)q.line(x-38,b-110+k*36,x+38,b-110+k*36,.3)});
      for(const d of[-1,1]){add('none',3.2,q=>q.line(x+d*46,b-84,x+d*64,b-160,.2));add('paper',1.6,q=>{q.rect(x+d*46-10,b-88,20,16,.2);q.ell(x+d*64,b-165,7,9,.05)})}
      cup(x-46,b-30,.7);cup(x+46,b-30,.7)}
    else{
      add('paper',2.2,q=>q.curve([[x-96,b-20],[x-100,b-120],[x-80,b-140],[x+80,b-140],[x+100,b-120],[x+96,b-20]],true));
      add('none',1,q=>{for(let k=0;k<3;k++)q.line(x-92,b-110+k*12,x+92,b-110+k*12,.3)});
      add('paper',1.8,q=>q.rect(x-100,b-22,200,22,.4));
      for(const d of[-1,0,1]){const gx=x+d*56;add('paper',1.5,q=>{q.rect(gx-11,b-70,22,16,.2);q.ell(gx,b-52,14,5,.05)});add('none',3,q=>q.line(gx,b-52,gx+34,b-50,.1))}
      cup(x+56,b-22,.7);
      spot('machine',x+rr(-40,40),b-140,o=>loafCat(x,b-139,S(o,38),o))}
  }
  function grinder(x,b){
    add('paper',2,q=>q.rect(x-26,b-62,52,62,.4));
    add('paper',1.8,q=>q.rect(x-16,b-94,32,32,.3));
    add('paper',2,q=>q.poly([[x-15,b-94],[x+15,b-94],[x+30,b-152],[x-30,b-152]],true,.3));
    add('paper',1.6,q=>q.ell(x,b-154,30,6,.05));
    add('ink',0,q=>{for(let i=0;i<9;i++)q.ell(x+rr(-18,18),b-rr(104,144),3,4,.1)});
    add('none',1.4,q=>{q.line(x-16,b-40,x+16,b-40,.2);q.line(x+26,b-50,x+44,b-54,.1)});
  }
  function register(x,b,v){
    if(v<.6){add('paper',2.2,q=>q.poly([[x-44,b],[x+44,b],[x+36,b-54],[x-36,b-54]],true,.5));
      add('paper',1.8,q=>q.rect(x-26,b-86,52,32,.4));
      add('none',1,q=>{for(let r=0;r<2;r++)for(let c=0;c<4;c++)q.rect(x-28+c*15,b-42+r*16,8,8,.2);q.line(x+44,b-40,x+56,b-60,.2)});
      add('paper',1.2,q=>q.ell(x+57,b-62,5,5,.1))}
    else{add('paper',2,q=>q.poly([[x-8,b],[x+8,b],[x+4,b-40],[x-4,b-40]],true,.2));
      add('paper',2,q=>q.poly([[x-38,b-40],[x+38,b-40],[x+42,b-94],[x-34,b-98]],true,.3));
      add('shade',1,q=>q.poly([[x-30,b-48],[x+32,b-48],[x+35,b-88],[x-27,b-91]],true,.2));
      add('paper',1.6,q=>q.rect(x+40,b-34,22,34,.2))}
  }
  // vitrína s dorty: kočka leží dole mezi zákusky
  function vitrine(x,b){const w=190,h=132,top=b-h,sy=b-68,cx=x+rr(-.22,.22)*w,t=R();
    add('paper',2.2,q=>q.rect(x-w/2,b-18,w,18,.4));
    add('paper',1.2,q=>q.rect(x-w/2+4,top,w-8,h-18,.2));
    add('none',1.4,q=>q.line(x-w/2+4,sy,x+w/2-4,sy,.2));
    if(t<.5){roundCake(x-44,sy,60);roundCake(x+42,sy,52)}else{slices(x-72,sy,3);roundCake(x+50,sy,54)}
    // kočka leží dole za zákusky
    const lo=cx<x?x+36:x-w/2+22;slices(lo,b-18,2);
    spot('vitrine',cx,b-18,o=>loafCat(cx,b-17,S(o,34),o));
    add('paper',1.4,q=>q.ell(cx+1,b-19,20,4,.1));add('paper',1.4,q=>q.poly([[cx-7,b-20],[cx+7,b-20],[cx+5,b-36],[cx-5,b-36]],true,.1));
    add('none',2,q=>q.rect(x-w/2+2,top,w-4,h-18,.3));
    add('paper',1.6,q=>q.rect(x-w/2-2,top-8,w+4,9,.2));
    add('none',1,q=>{q.line(x-w/2+14,top+10,x-w/2+36,top+40,.2);q.line(x-w/2+22,top+8,x-w/2+50,top+46,.2)});
  }
  function basket(x,b){const w=112;
    add('paper',1.6,q=>{q.ell(x-30,b-62,10,46,.05,-.3);q.ell(x-10,b-70,9,48,.05,-.1)});
    add('none',1,q=>{for(const[bx,by,a]of[[-30,-62,-.3],[-10,-70,-.1]])for(let k=-1;k<=1;k++){const cx=x+bx+Math.sin(-a)*k*18,cy=b+by+k*18;q.line(cx-5,cy+3,cx+5,cy-3,.1)}});
    // houska leží na okraji košíku až za kočkou, ať jí nepřekryje obličej
    add('paper',1.6,q=>q.curve([[x+w/2-22,b-46],[x+w/2-14,b-60],[x+w/2,b-64],[x+w/2+10,b-54],[x+w/2-4,b-48]],true));
    spot('basket',x+16,b-46,o=>peekCat(x+14,b-40,S(o,38),o));
    add('paper',2,q=>q.poly([[x-w/2,b-46],[x+w/2,b-46],[x+w/2-10,b],[x-w/2+10,b]],true,.4));
    add('none',1,q=>{for(let k=1;k<4;k++)q.line(x-w/2+3*k,b-46+k*11,x+w/2-3*k,b-46+k*11,.3);for(let k=-4;k<=4;k++)q.line(x+k*12,b-44,x+k*11,b-2,.3)});
  }
  function cookieJars(x,b){
    add('paper',1.8,q=>{q.rect(x-40,b-58,36,58,.3);q.rect(x-38,b-66,32,8,.2);q.ell(x-22,b-70,5,4,.1)});
    add('none',1,q=>{for(let i=0;i<3;i++)q.ell(x-22+rr(-8,8),b-12-i*16,8,6,.1)});
    spot('cookiejar',x+24,b-78,o=>peekCat(x+24,b-74,S(o,28),o));
    add('paper',1.8,q=>q.rect(x+2,b-78,44,78,.3));
    add('none',1,q=>{for(let i=0;i<3;i++)q.ell(x+24+rr(-10,10),b-12-i*18,9,7,.1)});
    add('paper',1.4,q=>{q.ell(x+64,b-5,16,5,.1)});
  }
  function budVase(x,b,k=1){
    add('none',1.2,q=>{for(const d of[-8,0,9])q.curve([[x,b-30*k],[x+d*.5*k,b-50*k],[x+d*k,b-70*k+Math.abs(d)*k]],false)});
    add('paper',1.2,q=>{for(const d of[-8,0,9])q.ell(x+d*k,b-72*k+Math.abs(d)*k,6*k,6*k,.1)});
    add('paper',1.6,q=>q.poly([[x-9*k,b],[x+9*k,b],[x+11*k,b-18*k],[x+4*k,b-32*k],[x-4*k,b-32*k],[x-11*k,b-18*k]],true,.2));
  }
  function counterSec(x0,x1,put){const w=x1-x0,cb=FY+54,ct=cb-236,S1=792,S2=952,tiles=R()<.5,bt=R();
    // zadní stěna: obklad z metro dlaždic
    const ty0=tiles?LY+14:S2+14;
    add('paper',0,q=>q.rect(x0,ty0,w,ct-ty0,0));
    add('none',.9,q=>{let r=0;for(let y=ty0+34;y<ct;y+=34,r++){q.line(x0,y,x1,y,.3);for(let x=x0+(r%2?36:0);x<x1;x+=72)q.line(x,y-34,x,y,.2)}});
    ledge(x0,x1);
    // tabule s menu: jedna velká, dvě menší nebo tři zavěšené
    if(bt<.4){const bw=w*rr(.36,.46);board(x0+40+bw/2+rr(0,w-80-bw),470,bw,220,true)}
    else if(bt<.75){const bw=w*rr(.26,.32);board(x0+w*.27,470,bw,210,true);board(x0+w*.73,490,bw,190,false)}
    else{add('none',1,q=>{for(let k=0;k<3;k++){const sx=x0+w*(.25+k*.25);q.line(sx-40,LY+14,sx-40,500,.2);q.line(sx+40,LY+14,sx+40,500,.2)}});
      for(let k=0;k<3;k++){const sx=x0+w*(.25+k*.25);add('paper',2.2,q=>q.rect(sx-66,494,132,190,.4));add('shade',1.2,q=>q.rect(sx-56,504,112,170,.3));
        add('none',1.2,q=>{for(let y=530;y<660;y+=24)q.line(sx-44,y,sx-44+rr(40,86),y,.6)},'paper')}}
    shelfRow(x0+30,x1-30,S1);shelfRow(x0+30,x1-30,S2);
    // rozvržení věcí na pultu (šířky), volná místa dostanou kočku
    const req=[['machine',190],['register',110],['vitrine',196]],opt=shuffle([['grinder',70],['basket',126],['jars',104],['dome',112],['vase',50]]).slice(0,3);
    const items=shuffle(req.concat(opt));let tot=items.reduce((s,i)=>s+i[1],0);const avail=w-80,GW=92,ng=3;
    while(tot>avail-ng*GW-40){const i=items.findIndex(t=>!req.includes(t));if(i<0)break;tot-=items[i][1];items.splice(i,1)}
    // dvě až tři volná místa pro kočky mezi věcmi, zbytek místa rozdělit do mezer
    const n=items.length,gs=new Set();while(gs.size<ng)gs.add(Math.floor(R()*(n+1)));
    const wts=items.map(()=>R()+.3).concat([R()+.3]),ws=wts.reduce((a,b)=>a+b,0),free=avail-tot-ng*GW,lay=[],gaps=[];
    const fill=[];{let cx=x0+40;for(let i=0;i<=n;i++){const g=free*wts[i]/ws;if(g>56)fill.push([cx+g/4,R()]);cx+=g/2;if(gs.has(i)){gaps.push([cx+GW/2,R()<.5]);cx+=GW}cx+=g/2;if(i<n){lay.push([items[i][0],cx+items[i][1]/2,R()]);cx+=items[i][1]}}}
    // kočka za pultem (vykukuje nad deskou)
    for(const[gx,beh]of gaps)if(beh)spot('counter',gx,ct,o=>peekCat(gx,ct-6,S(o,50),o));
    const ft=R();
    add('paper',2.4,q=>q.rect(x0,ct,w,cb-ct,.6));
    if(ft<.34)add('none',1,q=>{for(let p=x0+26;p<x1-10;p+=26)q.line(p,ct+22,p,cb-28,.3)});
    else if(ft<.67)add('none',1.1,q=>{const n=Math.round(w/170);for(let i=0;i<n;i++){const px=x0+14+i*(w-28)/n;q.rect(px,ct+30,(w-28)/n-18,cb-ct-70,.4);q.rect(px+12,ct+42,(w-28)/n-42,cb-ct-94,.3)}});
    else{add('shade',0,q=>{let r=0;for(let y=ct+30;y<cb-40;y+=22,r++)for(let x=x0+10+(r%2)*22;x<x1-22;x+=44)q.rect(x,y,22,22,.1)});
      add('none',1,q=>{q.line(x0,ct+30,x1,ct+30,.3);q.line(x0,cb-40,x1,cb-40,.3)})}
    add('shade',1.4,q=>q.rect(x0+6,cb-22,w-12,22,.3));
    add('none',3,q=>{q.line(x0+20,cb-60,x1-20,cb-60,.2);for(let p=x0+60;p<x1-40;p+=rr(200,280))q.line(p,cb-60,p,cb-26,.2)});
    add('paper',2.2,q=>q.rect(x0-18,ct-14,w+36,18,.6));
    const b=ct-14;
    // drobnosti v mezerách: spropitné, ubrousky, cukřenka, hrnky
    for(const[fx,u]of fill){if(u<.25){add('paper',1.4,q=>q.rect(fx-12,b-34,24,34,.2));add('none',1,q=>{q.line(fx-8,b-20,fx+8,b-20,.1);q.ell(fx,b-38,4,2,.1)})}
      else if(u<.5){add('paper',1.4,q=>{q.poly([[fx-16,b],[fx+16,b],[fx+12,b-20],[fx-12,b-20]],true,.2);q.poly([[fx-10,b-20],[fx+10,b-20],[fx+8,b-36],[fx-8,b-36]],true,.2)})}
      else if(u<.75){add('paper',1.4,q=>{q.ell(fx,b-14,14,14,.05);q.ell(fx,b-30,6,4,.1)})}
      else cupStack(fx,b,2)}
    for(const[k,x,v]of lay){
      if(k==='machine')machine(x,b,v);else if(k==='register')register(x,b,v);else if(k==='vitrine')vitrine(x,b);
      else if(k==='grinder')grinder(x,b);else if(k==='basket')basket(x,b);else if(k==='jars')cookieJars(x,b);
      else if(k==='dome')cake(x,b);else budVase(x,b)}
    // kočka na pultu za podnosem s cukřenkou
    for(const[gx,beh]of gaps)if(!beh){const sg=gx%2<1?-1:1;
      add('paper',1.5,q=>{q.ell(gx+sg*30,b-24,13,11,.05);q.ell(gx+sg*30,b-35,6,3,.1)});
      spot('ontop',gx,b,o=>o.alt?loafCat(gx,b-9,S(o,44),o):sitCat(gx,b-9,S(o,46),o));
      add('paper',1.8,q=>q.poly([[gx-42,b-18],[gx+42,b-18],[gx+38,b],[gx-38,b]],true,.3));
      add('none',1,q=>q.line(gx-36,b-9,gx+36,b-9,.2))}
    // barové stoličky před pultem
    const ns=Math.max(3,Math.floor(w/200));for(let i=0;i<ns;i++)put(stool,x0+w*(i+.5)/ns+rr(-30,30),cb+40,80,160,0,.55);
  }
  function stool(x,y){const t=R(),sy=y-150;
    if(t<.4){add('none',2.6,q=>{q.line(x-10,sy+6,x-28,y,.3);q.line(x+10,sy+6,x+28,y,.3);q.line(x-2,sy+8,x-6,y-4,.3);q.line(x-22,y-50,x+22,y-50,.2)});
      add('paper',2.2,q=>q.ell(x,sy,30,9,.04))}
    else if(t<.75){add('none',3.4,q=>q.line(x,sy+6,x,y-6,.2));add('paper',2,q=>{q.ell(x,y-5,30,7,.05)});add('none',1.8,q=>q.ell(x,y-58,20,5,.05));
      add('paper',2.2,q=>q.rect(x-30,sy-8,60,16,.8))}
    else{add('none',2.6,q=>{q.line(x-14,sy+6,x-26,y,.3);q.line(x+14,sy+6,x+26,y,.3);q.line(x-20,y-56,x+20,y-56,.2);q.line(x-22,sy,x-24,sy-62,.3);q.line(x+22,sy,x+24,sy-62,.3)});
      add('paper',2,q=>q.curve([[x-30,sy-50],[x,sy-58],[x+30,sy-50],[x+30,sy-70],[x,sy-78],[x-30,sy-70]],true));add('paper',2.2,q=>q.rect(x-30,sy-6,60,12,.5))}
    spot('stool',x,sy-8,o=>loafCat(x,sy-6,S(o,40),o));
  }

  /* salonek: obrazy, zrcadla, hodiny, dveře do kuchyně a nábytek u zdi */
  function pic(cx,top,w,h){const x=cx-w/2,t=R(),fs=R(),m=fs<.35?22:fs<.7?13:9,fx=cx+rr(-.3,.3)*w,poster=t>=.55&&t<.72,ft=top-m;
    // kočka vykukuje zpoza horní hrany rámu
    if(cordFree(fx-22,ft-40,fx+22,ft))spot('frametop',fx,ft,o=>peekCat(fx,ft+7,S(o,40),o));
    if(fs<.35){add('paper',2.6,q=>q.rect(x-m,top-m,w+2*m,h+2*m,.5));add('none',1,q=>q.rect(x-m+8,top-m+8,w+2*m-16,h+2*m-16,.3));
      add('paper',1.4,q=>{for(const[px,py]of[[x-m+4,top-m+4],[x+w+m-4,top-m+4],[x-m+4,top+h+m-4],[x+w+m-4,top+h+m-4]])q.ell(px,py,8,8,.1)})}
    else if(fs<.7){add('paper',2.4,q=>q.rect(x-m,top-m,w+2*m,h+2*m,.5));add('none',1,q=>q.rect(x-5,top-5,w+10,h+10,.3))}
    else{add('paper',4,q=>q.rect(x-m,top-m,w+2*m,h+2*m,.3));add('none',1,q=>q.rect(x-m+5,top-m+5,w+2*m-10,h+2*m-10,.2))}
    add(poster?'paper':'shade',1.4,q=>q.rect(x,top,w,h,.4));
    if(t<.2){add('paper',1.4,q=>q.poly([[x+3,top+h*.64],[x+w*.24,top+h*.38],[x+w*.42,top+h*.52],[x+w*.64,top+h*.3],[x+w*.84,top+h*.48],[x+w-3,top+h*.42],[x+w-3,top+h*.64]],true,.6));
      add('paper',1.2,q=>{q.ell(x+w*.78,top+h*.18,w*.07,w*.07,.05);q.rect(x+w*.22-3,top+h*.6,6,h*.3,.2);q.ell(x+w*.22,top+h*.56,w*.1,h*.1,.08)})}
    else if(t<.4){add('none',1.2,q=>q.line(x+3,top+h*.78,x+w-3,top+h*.78,.3));
      add('paper',1.4,q=>{q.ell(x+w*.42,top+h*.78,w*.22,h*.04,.05);q.poly([[x+w*.28,top+h*.5],[x+w*.56,top+h*.5],[x+w*.52,top+h*.76],[x+w*.32,top+h*.76]],true,.3)});
      add('none',1.2,q=>{q.curve([[x+w*.55,top+h*.54],[x+w*.66,top+h*.58],[x+w*.54,top+h*.68]],false);q.curve([[x+w*.38,top+h*.44],[x+w*.42,top+h*.34],[x+w*.38,top+h*.24]],false);q.curve([[x+w*.46,top+h*.44],[x+w*.5,top+h*.34],[x+w*.46,top+h*.26]],false)},'paper');
      add('paper',1.2,q=>q.curve([[x+w*.66,top+h*.77],[x+w*.72,top+h*.66],[x+w*.86,top+h*.64],[x+w*.92,top+h*.76],[x+w*.8,top+h*.72]],true))}
    else if(t<.55){add('paper',1.5,q=>q.curve([[cx-w*.36,top+h*.98],[cx-w*.32,top+h*.74],[cx,top+h*.64],[cx+w*.32,top+h*.74],[cx+w*.36,top+h*.98]],false));
      add('paper',1.5,q=>q.ell(cx,top+h*.42,w*.15,h*.16,.05));
      add('none',1.2,q=>q.curve([[cx-w*.16,top+h*.42],[cx-w*.18,top+h*.2],[cx,top+h*.2],[cx+w*.18,top+h*.22],[cx+w*.16,top+h*.46]],false))}
    else if(poster){add('none',1.3,q=>{q.poly([[cx-w*.22,top+h*.36],[cx+w*.22,top+h*.36],[cx+w*.16,top+h*.66],[cx-w*.16,top+h*.66]],true,.3);q.ell(cx,top+h*.68,w*.3,h*.03,.05);
      q.curve([[cx+w*.2,top+h*.42],[cx+w*.32,top+h*.48],[cx+w*.18,top+h*.58]],false);for(let k=0;k<3;k++)q.curve([[cx-w*.1+k*w*.1,top+h*.32],[cx-w*.06+k*w*.1,top+h*.24],[cx-w*.1+k*w*.1,top+h*.16]],false);
      q.line(x+w*.15,top+h*.08,x+w*.85,top+h*.08,.3);q.line(x+w*.2,top+h*.8,x+w*.8,top+h*.8,.3);q.line(x+w*.3,top+h*.88,x+w*.7,top+h*.88,.3)});
      add('ink',0,q=>{q.ell(x+w*.16,top+h*.9,5,7,.1);q.ell(x+w*.84,top+h*.9,5,7,.1)})}
    else if(t<.78){add('paper',1.4,q=>{q.ell(x+w*rr(.25,.45),top+h*rr(.3,.45),w*.16,w*.16,.05);q.rect(x+w*.5,top+h*.5,w*.3,h*.3,.4)});
      add('none',1.6,q=>{q.line(x+w*.1,top+h*.8,x+w*.9,top+h*.15,.5);q.line(x+w*.15,top+h*.2,x+w*.55,top+h*.9,.5)})}
    else{const pr=Math.min(w,h)*.14,px=x+w*rr(.35,.65),py=top+h*rr(.45,.62);
      add('none',1.1,q=>{q.curve([[x+w*.1,top+h*.08],[x+w*.22,top+h*.5],[x+w*.1,top+h*.92]],false);q.curve([[x+w*.9,top+h*.08],[x+w*.78,top+h*.5],[x+w*.9,top+h*.92]],false);q.line(x+w*.12,top+h*.8,x+w*.88,top+h*.8,.4)});
      if(cordFree(px-pr*1.3,py-pr*1.5,px+pr*1.3,py+pr))spot('portrait',px,py,o=>{head(px,py,pr,o);reg(o,px,py-pr*.3,pr*1.3)})}
  }
  function mirror(cx,cy,rx,ry){
    add('paper',2.6,q=>q.ell(cx,cy,rx+16,ry+16,.02));add('none',1.1,q=>q.ell(cx,cy,rx+8,ry+8,.02));
    add('paper',1.4,q=>q.ell(cx,cy,rx,ry,.02));
    add('none',1,q=>{for(let k=0;k<3;k++)q.line(cx-rx*.6+k*12,cy-ry*.1+k*6,cx-rx*.2+k*12,cy-ry*.6+k*6,.2)});
    add('paper',1.4,q=>q.ell(cx,cy-ry-16,8,6,.1));
  }
  function sunburst(cx,cy,r){
    add('none',2.2,q=>{for(let i=0;i<24;i++){const a=i/24*6.283,l=r+(i%2?24:40);q.line(cx+Math.cos(a)*(r+6),cy+Math.sin(a)*(r+6),cx+Math.cos(a)*l,cy+Math.sin(a)*l,.3)}});
    add('paper',2.4,q=>q.ell(cx,cy,r+6,r+6,.02));add('paper',1.2,q=>q.ell(cx,cy,r-8,r-8,.02));
    add('none',1,q=>{q.line(cx-r*.5,cy-r*.05,cx-r*.1,cy-r*.45,.2);q.line(cx-r*.4,cy+r*.12,cx+r*.05,cy-r*.3,.2)});
  }
  function wclock(cx,top){const w=96,h=250,hy=top+64;
    if(cordFree(cx-24,top-40,cx+24,top))spot('clock',cx,top,o=>peekCat(cx+o.dir*8,top+10,S(o,40),o));
    add('paper',2.4,q=>q.rect(cx-w/2,top+12,w,h-12,.5));
    add('paper',2.2,q=>{q.rect(cx-w/2-10,top,w+20,14,.4);q.poly([[cx-w/2+6,top+h],[cx+w/2-6,top+h],[cx,top+h+26]],true,.3)});
    add('paper',1.8,q=>q.ell(cx,hy,36,36,.02));
    add('none',1.1,q=>{for(let i=0;i<12;i++){const a=i/12*6.283;q.line(cx+Math.cos(a)*27,hy+Math.sin(a)*27,cx+Math.cos(a)*32,hy+Math.sin(a)*32,.1)}});
    add('none',2,q=>{q.line(cx,hy,cx+rr(-16,16),hy-20,.1);q.line(cx,hy,cx+24,hy+rr(-8,8),.1)});
    add('shade',1.2,q=>q.rect(cx-w/2+14,top+112,w-28,h-132,.3));
    add('none',1.6,q=>q.line(cx,top+112,cx+6,top+h-44,.1));add('paper',1.4,q=>q.ell(cx+6,top+h-38,12,12,.05));
  }
  function bracketPlant(cx,y){
    add('paper',1.3,q=>{for(let i=0;i<6;i++){const a=rr(.4,2.7),l=rr(30,50);q.ell(cx+Math.cos(a)*l*.6,y-50-Math.sin(a)*l*.7,16,6,.08,-a)}});
    if(cordFree(cx-24,y-84,cx+24,y-44))spot('bracket',cx,y-50,o=>peekCat(cx+o.dir*4,y-43,S(o,40),o));
    add('paper',2,q=>q.poly([[cx-28,y-50],[cx+28,y-50],[cx+22,y],[cx-22,y]],true,.3));
    add('none',2,q=>{q.line(cx-40,y+12,cx-40,y+56,.2);q.line(cx-40,y+56,cx-10,y+12,.2);q.line(cx+40,y+12,cx+40,y+56,.2);q.line(cx+40,y+56,cx+10,y+12,.2)});
    add('paper',2,q=>q.rect(cx-62,y,124,12,.3));
    vines(cx,y+4,4,40,80,130);
  }
  function kDoor(dx,dw){const dh=500,top=FY-dh,cx=dx+dw/2;
    add('paper',2.6,q=>q.rect(dx-20,top-22,dw+40,dh+22,.5));
    add('paper',1.6,q=>q.rect(cx-52,top-76,104,36,.3));
    add('none',1,q=>{q.line(cx-38,top-64,cx+38,top-64,.3);q.line(cx-26,top-53,cx+26,top-53,.3)});
    if(R()<.55){const py=top+140;
      add('paper',2.2,q=>q.rect(dx,top,dw,dh,.4));
      add('none',1,q=>{q.rect(dx+24,top+250,dw-48,dh-320,.4);q.rect(dx+34,top+260,dw-68,dh-340,.3)});
      add('shade',1.4,q=>q.ell(cx,py,42,42,.02));
      spot('porthole',cx,py,o=>peekCat(cx,py+26,S(o,40),o));
      add('none',6,q=>q.ell(cx,py,43,43,.02));add('none',1.2,q=>q.ell(cx,py,52,52,.02));
      add('paper',1.4,q=>{q.rect(dx+12,FY-64,dw-24,48,.3);q.rect(dx+dw-44,top+230,20,70,.2)})}
    else{const sx=cx+rr(-.25,.25)*dw;
      add('shade',1.8,q=>q.rect(dx,top,dw,dh,.4));
      add('paper',1.2,q=>{q.rect(dx+16,top+300,dw-32,10,.2);q.rect(dx+30,top+262,34,38,.2);q.ell(dx+dw-60,top+284,22,16,.05);q.rect(dx+10,top+400,dw-20,dh-400,.3)});
      spot('doorway',sx,FY-4,o=>sitCat(sx,FY-4,S(o,46),o));
      add('paper',1.6,q=>{const p=[[dx-4,top],[dx+dw+4,top]];for(let xx=dx+dw+4;xx>dx-4;xx-=26)p.push([xx,top+dh*.4+(Math.round(xx/26)%2?8:0)]);p.push([dx-4,top+dh*.4]);q.poly(p,true,.3)});
      add('none',1,q=>{for(let xx=dx+20;xx<dx+dw-8;xx+=26)q.curve([[xx,top+6],[xx+3,top+dh*.2],[xx-2,top+dh*.38]],false)});
      add('none',2.4,q=>q.line(dx-10,top+2,dx+dw+10,top+2,.2))}
  }
  // nábytek u zdi (kreslí se přes place spolu s podlahou)
  function sofa(x,y){const w=rr(320,360),n=R()<.5?2:3,t=R(),gx=x+rr(-.12,.12)*w,sx=x+rr(-.3,.3)*w,ax=x+(R()<.5?-1:1)*(w/2),np=R()<.5?2:3;
    // kočka za opěradlem: hlava nad horní hranou
    spot('sofa',gx,y-200,o=>peekCat(gx,y-193,S(o,42),o));
    add('paper',2.4,q=>q.rect(x-w/2+14,y-200,w-28,116,.8));
    if(t<.5)add('ink',0,q=>{for(let r=0;r<2;r++)for(let k=1;k<7;k++)q.ell(x-w/2+14+(w-28)*k/7,y-172+r*40,2.5,2.5,.1)});
    else add('none',1,q=>{for(let k=1;k<9;k++)q.line(x-w/2+14+(w-28)*k/9,y-194,x-w/2+14+(w-28)*k/9,y-92,.4)});
    for(let k=0;k<n;k++){const cw=(w-80)/n,cx=x-w/2+40+cw*k;add('paper',2,q=>q.rect(cx+2,y-104,cw-4,30,.8))}
    const pp=[];for(let k=0;k<np;k++)pp.push(k<np/2?x-w/2+50+k*56:x+w/2-50-(np-1-k)*56);
    for(const px of pp){const pt=R();add('paper',2,q=>q.poly([[px-30,y-104],[px+30,y-104],[px+26,y-166],[px-26,y-170]],true,.6));
      add('none',1,q=>{if(pt<.5){for(let k=-1;k<=1;k++)q.line(px-26,y-137+k*14,px+26,y-137+k*14,.3)}else q.ell(px,y-136,10,10,.1)})}
    spot('sofaseat',sx,y-104,o=>sleepCat(sx,y-103,S(o,46),o));
    add('paper',2.2,q=>q.rect(x-w/2+10,y-76,w-20,50,.8));
    add('paper',2.4,q=>{q.rect(x-w/2-20,y-140,44,116,.8);q.rect(x+w/2-24,y-140,44,116,.8)});
    add('paper',1.8,q=>{q.ell(x-w/2+2,y-140,24,10,.05);q.ell(x+w/2-2,y-140,24,10,.05)});
    add('none',2.4,q=>{q.line(x-w/2-10,y-24,x-w/2-8,y,.3);q.line(x+w/2+10,y-24,x+w/2+8,y,.3)});
    spot('sofaarm',ax,y-148,o=>loafCat(ax,y-146,S(o,36),o));
  }
  function bookcase(x,y){const w=rr(170,200),h=rr(380,420),top=y-h,n=4,sh=(h-40)/n,gr=Math.floor(R()*n),gx=x+rr(-.25,.25)*(w-80);
    add('paper',2.4,q=>q.rect(x-w/2,top,w,h,.5));
    add('shade',1.2,q=>q.rect(x-w/2+12,top+14,w-24,h-40,.3));
    const bk=[];
    for(let r=0;r<n;r++){const by=top+14+sh*(r+1);for(let bx=x-w/2+14;bx<x+w/2-26;){if(r===gr&&bx>gx-40&&bx<gx+40){bx=gx+40;continue}
      const bw=rr(10,20),bh=sh*rr(.6,.85);if(bx+bw>x+w/2-14)break;bk.push([bx,by,bw,bh]);bx+=bw+rr(0,3)}}
    add('paper',1.2,q=>{for(const[bx,by,bw,bh]of bk)q.rect(bx,by-bh,bw,bh,.2)});
    add('none',.9,q=>{for(const[bx,by,bw,bh]of bk)if(bw>14)q.line(bx+3,by-bh*.7,bx+bw-3,by-bh*.7,.1)});
    add('paper',1.8,q=>{for(let r=1;r<=n;r++)q.rect(x-w/2+8,top+14+sh*r-4,w-16,10,.2)});
    const cy=top+14+sh*(gr+1)-4;spot('bookcase',gx,cy,o=>loafCat(gx,cy,S(o,38),o));
    add('paper',2.2,q=>q.rect(x-w/2-8,top-12,w+16,14,.4));
    const tx=x+rr(-.3,.3)*w,ox=tx>x?x-w*.3:x+w*.3;
    add('paper',1.6,q=>{q.ell(ox,top-40,24,24,.05);q.rect(ox-4,top-16,8,6,.1)});add('none',1,q=>q.curve([[ox-24,top-40],[ox,top-30],[ox+24,top-40]],false));
    // kočka sedí nahoře za řadou knih
    spot('bookcasetop',tx,top-12,o=>sitCat(tx,top-13,S(o,42),o));
    add('paper',1.4,q=>{for(let i=0;i<5;i++)q.rect(tx-32+i*13,top-12-[22,18,24,16,20][i],12,[22,18,24,16,20][i],.2)});
    add('paper',1.4,q=>q.poly([[tx+33,top-12],[tx+39,top-12],[tx+54,top-38],[tx+48,top-40]],true,.2));
  }
  function piano(x,y){const w=270,h=300,top=y-h,kb=y-150,px=x+rr(-.35,.35)*w,ux=x+rr(-.2,.2)*w;
    add('paper',2.4,q=>q.rect(x-w/2+14,kb+6,w-28,y-kb-26,.4));
    // pod pianem za hromádkou not
    spot('underpiano',ux,y-30,o=>peekCat(ux,y-24,S(o,38),o));
    add('paper',1.4,q=>{q.rect(ux-34,y-9,68,9,.2);q.rect(ux-30,y-17,62,8,.2);q.rect(ux-33,y-24,64,7,.2);q.rect(ux-28,y-30,56,6,.2)});
    // za pianem u zdi: hlava nad víkem
    spot('piano',px,top-12,o=>peekCat(px,top-3,S(o,42),o));
    add('paper',2.4,q=>q.rect(x-w/2,top,w,kb-top-20,.5));
    add('none',1,q=>{q.rect(x-w/2+20,top+20,w-40,kb-top-70,.4);q.rect(x-w/2+34,top+34,w-68,kb-top-98,.3)});
    add('paper',2,q=>q.rect(x-w/2-8,kb-20,w+16,24,.3));
    add('none',.9,q=>{for(let k=1;k<30;k++)q.line(x-w/2-8+k*(w+16)/30,kb-12,x-w/2-8+k*(w+16)/30,kb+4,.1)});
    add('ink',0,q=>{for(let k=1;k<30;k++)if(k%7!==3&&k%7!==0)q.rect(x-w/2-10+k*(w+16)/30,kb-12,5,9,.05)});
    add('paper',1.4,q=>q.poly([[x-50,kb-22],[x+50,kb-22],[x+46,kb-90],[x-46,kb-90]],true,.2));
    add('none',.9,q=>{for(let k=0;k<5;k++)q.line(x-40,kb-80+k*10,x+40,kb-80+k*10,.1)});
    add('paper',2.2,q=>{q.rect(x-w/2+4,kb+4,20,y-kb-4,.2);q.rect(x+w/2-24,kb+4,20,y-kb-4,.2)});
    add('paper',2.2,q=>q.rect(x-w/2-8,top-12,w+16,14,.3));
    const ox=px>x?x-w*.3:x+w*.3;
    add('paper',1.6,q=>{q.poly([[ox-16,top-12],[ox+16,top-12],[ox+4,top-70],[ox-4,top-70]],true,.2);q.rect(ox+30*(px>x?1:-1)-14,top-50,28,38,.2)});
    add('none',1.4,q=>q.line(ox,top-20,ox+10,top-60,.1));
  }
  function dresser(x,y){const w=rr(230,260),top=y-470,st=y-182,dx=x+rr(-.3,.3)*w,tx=x+rr(-.3,.3)*w;
    // kočka za římsou kredence
    spot('dressertop',tx,top,o=>peekCat(tx,top+10,S(o,42),o));
    add('paper',2.2,q=>q.rect(x-w/2+10,top+14,w-20,st-top-14,.4));
    add('none',.9,q=>{for(let xx=x-w/2+30;xx<x+w/2-20;xx+=20)q.line(xx,top+20,xx,st-4,.2)});
    for(const sy of[top+120,top+210]){add('paper',1.4,q=>{for(let xx=x-w/2+44;xx<x+w/2-30;xx+=44)q.ell(xx,sy-26,20,24,.04)});
      add('none',.9,q=>{for(let xx=x-w/2+44;xx<x+w/2-30;xx+=44)q.ell(xx,sy-26,11,13,.04)});
      add('paper',1.8,q=>q.rect(x-w/2+10,sy,w-20,10,.2))}
    add('paper',2.2,q=>{q.rect(x-w/2,top+14,16,st-top-14,.3);q.rect(x+w/2-16,top+14,16,st-top-14,.3)});
    add('paper',2.4,q=>q.rect(x-w/2-10,top,w+20,18,.4));
    add('paper',2.4,q=>q.rect(x-w/2,st,w,182,.5));
    add('paper',2.2,q=>q.rect(x-w/2-10,st-12,w+20,14,.4));
    add('none',1.1,q=>{q.line(x-w/2,st+40,x+w/2,st+40,.3);q.line(x,st+2,x,st+40,.2);q.rect(x-w/2+14,st+54,w/2-22,112,.3);q.rect(x+8,st+54,w/2-22,112,.3)});
    add('paper',1.2,q=>{q.ell(x-20,st+22,5,5,.1);q.ell(x+20,st+22,5,5,.1)});
    const jx=dx>x?x-w*.28:x+w*.28;
    add('paper',1.8,q=>q.poly([[jx-16,st-12],[jx+16,st-12],[jx+18,st-52],[jx+10,st-66],[jx-12,st-66],[jx-18,st-52]],true,.3));
    spot('dresser',dx,st-12,o=>loafCat(dx,st-11,S(o,40),o));  }
  function bigPlant(x,y){const pw=rr(66,84),ph=pw*.9,top=y-ph,t=R();
    if(t<.34){add('none',1.8,q=>{for(let i=0;i<6;i++){const a=rr(.5,2.7),l=rr(130,190),ex=x+Math.cos(a)*l,ey=top-Math.sin(a)*l*.8;
      q.curve([[x,top],[x+Math.cos(a)*l*.4,top-l*.6],[ex,ey]],false);for(let k=1;k<7;k++){const u=k/7,px=x+(ex-x)*u,py=top+(ey-top)*u-Math.sin(u*3.14)*l*.2;q.line(px,py,px+Math.cos(a+1.2)*20,py+12,.2);q.line(px,py,px+Math.cos(a-1.2)*20,py+14,.2)}}})}
    else if(t<.67){add('none',1.8,q=>{for(let i=0;i<6;i++){const a=rr(.4,2.8),l=rr(100,160);q.curve([[x,top],[x+Math.cos(a)*l*.3,top-l*.6],[x+Math.cos(a)*l,top-Math.sin(a)*l*.9]],false)}});
      add('paper',1.6,q=>{for(let i=0;i<6;i++){const a=rr(.4,2.8),l=rr(100,160);q.ell(x+Math.cos(a)*l,top-Math.sin(a)*l*.9,30,22,.08,-a)}})}
    else{add('none',3,q=>q.curve([[x,top],[x-6,top-120],[x+4,top-260]],false));
      add('paper',1.2,q=>{for(let i=0;i<30;i++){const a=R()*6.283,d=Math.sqrt(R())*80;q.ell(x+Math.cos(a)*d,top-240+Math.sin(a)*d*.9,11,6,.1,a)}})}
    spot('plant',x,top,o=>peekCat(x+o.dir*6,top+3,S(o,44),o));
    add('paper',2.2,q=>q.poly([[x-pw/2,top],[x+pw/2,top],[x+pw*.36,y],[x-pw*.36,y]],true,.4));
    add('paper',2,q=>q.rect(x-pw/2-6,top-4,pw+12,14,.3));
  }
  function umbrellas(x,y){
    add('none',2.2,q=>{q.line(x-10,y-40,x-24,y-160,.2);q.curve([[x-24,y-160],[x-30,y-178],[x-16,y-180]],false);q.line(x+8,y-40,x+18,y-150,.2);q.curve([[x+18,y-150],[x+22,y-168],[x+8,y-168]],false)});
    add('paper',1.4,q=>q.poly([[x-22,y-60],[x-32,y-140],[x-18,y-140]],true,.2));
    spot('umbrella',x,y-64,o=>peekCat(x+o.dir*4,y-58,S(o,40),o));
    add('paper',2.2,q=>q.rect(x-28,y-64,56,64,.3));add('paper',1.8,q=>q.ell(x,y-64,28,6,.05));
    add('none',1,q=>{q.line(x-28,y-44,x+28,y-44,.2);q.line(x-28,y-18,x+28,y-18,.2)});
  }
  function coatRack(x,y){const h=440,top=y-h;
    add('none',4,q=>q.line(x,y-6,x,top,.2));
    add('none',3,q=>{q.line(x,y-30,x-34,y,.2);q.line(x,y-30,x+34,y,.2);for(const d of[-1,1])q.curve([[x,top+30],[x+d*24,top+20],[x+d*30,top+4]],false)});
    add('paper',1.8,q=>{q.poly([[x-24,top+24],[x-6,top+30],[x-2,top+280],[x-50,top+290],[x-44,top+80]],true,.4);q.poly([[x+6,top+26],[x+26,top+24],[x+46,top+80],[x+54,top+240],[x+8,top+236]],true,.4)});
    add('none',1,q=>{q.line(x-26,top+40,x-24,top+280,.2);q.line(x+26,top+40,x+30,top+234,.2)});
    // kočka nahoře za kloboukem
    spot('rack',x,top-40,o=>peekCat(x+o.dir*6,top-34,S(o,38),o));
    add('paper',1.6,q=>{q.ell(x,top-4,40,8,.05);q.rect(x-24,top-40,48,36,.3)});
    add('none',2.4,q=>q.curve([[x+30,top+10],[x+34,top+60],[x+24,top+140]],false));
  }
  function flamp(x,y){const h=420;
    add('none',2.6,q=>{q.line(x,y-6,x,y-h+50,.2);q.line(x,y-6,x-30,y,.2);q.line(x,y-6,x+30,y,.2)});
    spot('floorlamp',x,y-h,o=>peekCat(x+o.dir*3,y-h+7,S(o,38),o));
    add('paper',2,q=>q.poly([[x-30,y-h],[x+30,y-h],[x+42,y-h+56],[x-42,y-h+56]],true,.3));
    add('none',1,q=>{for(let k=-3;k<=3;k++)q.line(x+k*12,y-h+58,x+k*12,y-h+66,.1)});
  }
  function salon(x0,x1,put,furnTops){const dw=220,side=R()<.5,dx=side?x0+30:x1-30-dw;
    kDoor(dx,dw);furnTops.push([dx-30,dx+dw+30,FY-600]);
    const ax0=side?dx+dw+44:x0+16,ax1=side?x1-16:dx-44;
    const big=shuffle([[sofa,380,200],[bookcase,210,440],[piano,290,380],[dresser,270,500]]),small=shuffle([[bigPlant,110,300],[umbrellas,70,190],[coatRack,120,460],[flamp,90,430]]);
    const list=shuffle([big[0],big[1],small[0]]).concat([small[1]]);
    let fx=ax0+rr(0,30);
    for(const[f,w,h]of list){if(fx+w>ax1)continue;const cx=fx+w/2;if(put(f,cx,FY+26,w-16))furnTops.push([fx,fx+w,FY+26-h]);fx+=w+rr(10,40)}
    return[ax0,ax1];
  }
  function gallery(x0,x1,furnTops){
    const lim=(a,c)=>{let l=FY-300;for(const[f0,f1,t]of furnTops)if(a<f1&&c>f0)l=Math.min(l,t-90);return l};
    const arts=[],ok=(a,b,c,d)=>a>=x0+20&&c<=x1-20&&b>=LY+96&&d<=lim(a,c)&&lampFree(a,b-70,c,d)&&!arts.some(r=>a<r[2]+30&&c>r[0]-30&&b-76<r[3]&&d>r[1]-76);
    const used={};
    // nejdřív zkusit konzoli s květinou a hodiny, pak obrazy
    for(let i=0;i<160&&arts.length<8;i++){const u=i<25&&!used.bracket?.3:i<50&&!used.clock?.05:R();let k='pic',w,h,p;
      if(u<.1&&!used.clock){k='clock';w=116;h=290}
      else if(u<.2&&!used.mirror){k='mirror';p=[rr(44,60)];p.push(p[0]*rr(1.2,1.45));w=2*p[0]+36;h=2*p[1]+48}
      else if(u<.28&&!used.sun){k='sun';p=[rr(40,54)];w=h=2*p[0]+84}
      else if(u<.38&&!used.bracket){k='bracket';w=130;h=250}
      else{p=[rr(80,180),rr(100,220)];w=p[0]+44;h=p[1]+44}
      const a=rr(x0+20,x1-20-w),l=lim(a,a+w)-h;if(l<LY+96)continue;const b=rr(LY+96,l);if(!ok(a,b,a+w,b+h))continue;
      arts.push([a,b,a+w,b+h,k,p]);used[k==='pic'?'x':k]=1}
    for(const[a,b,c,d,k,p]of arts){const cx=(a+c)/2;
      if(k==='pic')pic(cx,b+22,p[0],p[1]);else if(k==='clock')wclock(cx,b);else if(k==='mirror')mirror(cx,b+32+p[1],p[0],p[1]);
      else if(k==='sun')sunburst(cx,(b+d)/2,p[0]);else bracketPlant(cx,b+120)}
  }

  /* stolky a věci na podlaze */
  function chair(x,y,f,st,k){const sy=y-92*k,bx=x-f*28*k,sw=32*k,ux=x+f*6*k;
    if(clearFloor(ux,y,34))spot('underchair',ux,y,o=>loafCat(ux,y-1,S(o,38*k),o));
    add('none',2.4,q=>{q.line(x-f*20*k,sy+4,x-f*24*k,y,.3);q.line(x+f*22*k,sy+4,x+f*26*k,y,.3)});
    if(st===0){// ohýbaná (thonetka): zadní noha přechází v oblouk opěradla
      add('none',2.6,q=>q.curve([[bx-f*6*k,y],[bx-f*2*k,sy],[bx-f*6*k,sy-60*k],[bx+f*4*k,sy-112*k],[bx+f*18*k,sy-104*k],[bx+f*16*k,sy-50*k],[bx+f*12*k,sy]],false));
      add('none',1.6,q=>q.curve([[bx+f*2*k,sy-8*k],[bx+f*2*k,sy-70*k],[bx+f*8*k,sy-96*k],[bx+f*12*k,sy-60*k],[bx+f*10*k,sy-8*k]],false));
      add('none',1.4,q=>q.ell(x,y-40*k,22*k,5*k,.05))}
    else if(st===1){add('none',2.6,q=>{q.line(bx,y,bx,sy-116*k,.3);q.line(bx+f*14*k,sy-6*k,bx+f*14*k,sy-110*k,.3);for(let j=1;j<4;j++){const yy=sy-j*28*k;q.line(bx,yy,bx+f*14*k,yy+4*k,.2)}});
      add('none',1.6,q=>q.line(x-f*22*k,y-36*k,x+f*24*k,y-36*k,.2))}
    else{add('none',2.6,q=>q.line(bx,y,bx-f*3*k,sy-10*k,.3));
      add('paper',2,q=>q.curve([[bx-f*6*k,sy-4*k],[bx-f*10*k,sy-70*k],[bx-f*2*k,sy-106*k],[bx+f*12*k,sy-98*k],[bx+f*10*k,sy-4*k]],true));
      add('none',1,q=>q.line(bx+f*2*k,sy-80*k,bx+f*2*k,sy-22*k,.3))}
    add('paper',2,q=>q.rect(x-sw,sy-8*k,sw*2,11*k,.4));
    spot('chair',x,sy-8*k,o=>sleepCat(x+f*4,sy-7*k,S(o,42*k),o));
  }
  // náhodné hodnoty hned, kreslení až po kočce (vrací funkci) – kočka pak leží mezi nádobím
  function tItems(x,ty,rx,k){const u=R(),a=x-rx*rr(.2,.5),b=x+rx*rr(.15,.45);return[a,b,()=>{
    cup(a,ty-1,.8*k);
    if(u<.28)teapot(b,ty-1,.8*k);
    else if(u<.48){add('paper',1.4,q=>q.ell(b,ty-3,22*k,5*k,.1));slices(b-6,ty-5,1)}
    else if(u<.68)budVase(b,ty-1,.8*k);
    else if(u<.84){add('paper',1.3,q=>q.poly([[b-26*k,ty-2],[b+22*k,ty-2],[b+28*k,ty-10*k],[b-18*k,ty-12*k]],true,.2));add('none',.9,q=>{q.line(b-12*k,ty-6*k,b+14*k,ty-6*k,.1)})}
    else cup(b,ty-1,.8*k)}]
  }
  function bistro(x,y){const k=dsc(y),rx=rr(66,78)*k,ty=y-152*k,st=Math.floor(R()*3),ux=x+rr(-.3,.3)*rx,sd=R();
    if(clearFloor(ux,y,34))spot('undertable',ux,y,o=>loafCat(ux,y-2,S(o,40*k),o));
    add('none',3.4,q=>q.line(x,ty+8,x,y-12,.3));
    add('none',2.6,q=>{q.line(x,y-12,x-34*k,y,.3);q.line(x,y-12,x+34*k,y,.3);q.line(x,y-12,x+6,y-3,.2)});
    add('paper',2.2,q=>q.ell(x,ty,rx,11*k,.03));
    add('none',1.4,q=>q.curve([[x-rx,ty+1],[x,ty+15*k],[x+rx,ty+1]],false));
    const[ia,ib,ti]=tItems(x,ty-4*k,rx,k);
    const tx=ia-8*k+rr(-.05,.05)*rx;spot('table',tx,ty,o=>loafCat(tx,ty+2,S(o,38*k),o));ti();
    for(const s of[-1,1])if(sd<.75||s===(sd<.87?1:-1))chair(x+s*(rx+36*k),y+rr(4,20),-s,st,k);
  }
  function clothT(x,y){const k=dsc(y),w=rr(136,156)*k,ty=y-152*k,hem=y-34*k,pat=R(),ux=x+rr(-.2,.2)*w,st=Math.floor(R()*3);
    if(clearFloor(ux,y,34))spot('cloth',ux,y,o=>loafCat(ux,y-2,S(o,40*k),o));
    add('none',2.6,q=>{q.line(x-w/2+6,hem,x-w/2+6,y,.2);q.line(x+w/2-6,hem,x+w/2-6,y,.2)});
    add('paper',2.2,q=>q.poly([[x-w/2-8,ty],[x+w/2+8,ty],[x+w/2+14,hem],[x-w/2-14,hem]],true,.4));
    if(pat<.4)add('shade',0,q=>{const rw=(w+28)/8;for(let r=0;r<4;r++)for(let c=0;c<8;c++){if((r+c)%2)continue;const y0=ty+(hem-ty)*r/4,y1=ty+(hem-ty)*(r+1)/4,xa=t=>x-w/2-8-6*t+c*(w+16+12*t)/8,t0=r/4,t1=(r+1)/4;
      q.poly([[xa(t0),y0],[xa(t0)+(w+16+12*t0)/8,y0],[xa(t1)+(w+16+12*t1)/8,y1],[xa(t1),y1]],true,.1)}});
    else if(pat<.7)add('none',1,q=>{q.line(x-w/2-12,hem-10,x+w/2+12,hem-10,.3);q.line(x-w/2-12,hem-16,x+w/2+12,hem-16,.3)});
    else add('none',1,q=>{const p=[];for(let i=0;i<=10;i++)p.push([x-w/2-14+i*(w+28)/10,hem+(i%2?6:0)]);q.poly(p,false,.2);for(let i=0;i<5;i++)q.curve([[x-w/2+i*w/4,ty+6],[x-w/2+i*w/4-4,(ty+hem)/2],[x-w/2+i*w/4-8,hem-4]],false)});
    add('paper',2,q=>q.poly([[x-w/2+12,ty-14*k],[x+w/2-12,ty-14*k],[x+w/2+8,ty],[x-w/2-8,ty]],true,.3));
    const[ia,ib,ti]=tItems(x,ty-6*k,w/2,k);
    const tx=ia-8*k+rr(-.04,.04)*w;spot('table',tx,ty-8*k,o=>loafCat(tx,ty-6*k,S(o,38*k),o));ti();
    for(const s of[-1,1])chair(x+s*(w/2+40*k),y+rr(4,20),-s,st,k);
  }
  function armchair(x,y,k,t){const w=150*k,sx=x+rr(-8,8);
    // kočka za opěradlem ušáku
    spot('armchair',sx,y-196*k,o=>peekCat(sx,y-186*k,S(o,40*k),o));
    add('paper',2.2,q=>q.curve([[x-w*.42,y-66*k],[x-w*.46,y-176*k],[x,y-196*k],[x+w*.46,y-176*k],[x+w*.42,y-66*k]],true));
    if(t<.5)add('ink',0,q=>{for(let r=0;r<2;r++)for(let c=-1;c<=1;c++)q.ell(x+c*w*.2,y-160*k+r*36*k,2.5,2.5,.1)});
    else add('none',1,q=>{for(let c=-2;c<=2;c++)q.line(x+c*w*.12,y-184*k,x+c*w*.12,y-96*k,.3)});
    add('paper',2,q=>q.rect(x-w*.36,y-94*k,w*.72,32*k,.8));
    add('paper',2.2,q=>q.rect(x-w*.46,y-64*k,w*.92,48*k,.7));
    add('paper',2.2,q=>{q.rect(x-w/2,y-124*k,w*.2,108*k,.8);q.rect(x+w*.3,y-124*k,w*.2,108*k,.8)});
    add('paper',1.8,q=>{q.ell(x-w*.4,y-124*k,w*.11,8*k,.05);q.ell(x+w*.4,y-124*k,w*.11,8*k,.05)});
    add('none',2.4,q=>{q.line(x-w*.42,y-16*k,x-w*.44,y,.2);q.line(x+w*.42,y-16*k,x+w*.44,y,.2)});
  }
  function armSet(x,y){const k=dsc(y),t=R(),ux=x+rr(-20,20);
    armchair(x-130*k,y-6,k,t);
    if(clearFloor(ux,y,30))spot('undertable',ux,y,o=>loafCat(ux,y-1,S(o,36),o));
    add('none',3,q=>{q.line(x-36*k,y-70*k,x-40*k,y,.2);q.line(x+36*k,y-70*k,x+40*k,y,.2)});
    add('paper',2.2,q=>q.ell(x,y-74*k,58*k,10*k,.03));
    add('paper',1.4,q=>{q.rect(x-30*k,y-84*k,44*k,8*k,.2);q.rect(x-26*k,y-92*k,38*k,8*k,.2)});
    cup(x+26*k,y-76*k,.7*k);
    armchair(x+130*k,y-2,k,t);
  }
  function sacks(x,y){const d=R()<.5?-1:1;
    spot('sacks',x+d*10,y-100,o=>peekCat(x+d*12,y-94,S(o,46),o));
    for(const[ox,oy,w,h]of[[-40,0,78,58],[40,0,78,58],[0,-46,78,54]]){
      add('paper',2.2,q=>q.curve([[x+ox-w/2,y+oy],[x+ox-w/2-4,y+oy-h*.6],[x+ox-w/2+6,y+oy-h],[x+ox,y+oy-h-6],[x+ox+w/2-6,y+oy-h],[x+ox+w/2+4,y+oy-h*.6],[x+ox+w/2,y+oy]],true));
      add('none',1,q=>{q.ell(x+ox,y+oy-h*.45,12,8,.1);q.line(x+ox-4,y+oy-h*.52,x+ox+4,y+oy-h*.38,.1);q.line(x+ox-w*.3,y+oy-h*.18,x+ox+w*.3,y+oy-h*.18,.3)})}
    add('ink',0,q=>{for(let i=0;i<7;i++)q.ell(x+rr(-70,70),y+rr(2,10),3,4,.2)});
    add('paper',1.4,q=>{q.ell(x-d*86,y-6,14,6,.05);q.rect(x-d*86-(d>0?28:0),y-8,28,4,.1)});
  }
  function trolley(x,y){const k=dsc(y),w=150*k,lx=x+rr(-.2,.2)*w;
    add('paper',1.6,q=>{q.ell(x-w/2+12,y-8,8,8,.05);q.ell(x+w/2-12,y-8,8,8,.05)});
    add('paper',2,q=>q.rect(x-w/2,y-64*k,w,10*k,.3));
    spot('trolley',lx,y-64*k,o=>loafCat(lx,y-63*k,S(o,38*k),o));
    add('none',2.4,q=>{q.line(x-w/2+4,y-16,x-w/2+4,y-160*k,.2);q.line(x+w/2-4,y-16,x+w/2-4,y-160*k,.2);q.curve([[x+w/2-4,y-160*k],[x+w/2+20,y-170*k],[x+w/2+22,y-196*k]],false)});
    add('paper',2,q=>q.rect(x-w/2,y-160*k,w,10*k,.3));
    roundCake(x-w*.2,y-160*k,52*k);slices(x+w*.12,y-160*k,2);
  }
  // pelíšek – plstěná budka s kulatým vchodem, kočka vykukuje ven
  function catbed(x,y){const k=dsc(y),w=118*k;
    add('paper',2,q=>q.curve([[x-w/2,y-4],[x-w/2+2,y-54*k],[x-w/4,y-92*k],[x,y-100*k],[x+w/4,y-92*k],[x+w/2-2,y-54*k],[x+w/2,y-4]],true));
    add('none',1,q=>{for(const d of[-1,1])q.curve([[x+d*w*.3,y-10*k],[x+d*w*.34,y-54*k],[x+d*w*.14,y-92*k]],false);q.ell(x,y-104*k,7*k,6*k,.1)});
    add('shade',1.4,q=>q.ell(x,y-36*k,27*k,28*k,.03));
    spot('catbed',x,y-60*k,o=>peekCat(x,y-16*k,S(o,44*k),o));
    add('paper',2,q=>q.curve([[x-w/2,y-4],[x-30*k,y-16*k],[x,y-20*k],[x+30*k,y-16*k],[x+w/2,y-4],[x,y+3]],true));
    add('none',1,q=>{for(let i=-3;i<=3;i++)q.line(x+i*w*.12,y-12*k,x+i*w*.12+4,y-2,.2)});
    add('paper',1.6,q=>{q.ell(x+w/2+34,y-6,20,6,.05);q.ell(x+w/2+80,y-6,18,6,.05)});
    add('none',1.2,q=>q.curve([[x+w/2+70,y-8],[x+w/2+80,y-12],[x+w/2+90,y-8],[x+w/2+94,y-12]],false));
  }
  function papers(x,y){const k=dsc(y),px=x+rr(-12,12);
    add('paper',1.6,q=>{q.poly([[x-38,y-80],[x-6,y-86],[x-2,y-150],[x-30,y-146]],true,.3);q.poly([[x+4,y-84],[x+36,y-80],[x+40,y-138],[x+10,y-142]],true,.3)});
    add('none',.9,q=>{for(let i=0;i<4;i++){q.line(x-30,y-136+i*12,x-8,y-138+i*12,.1);q.line(x+12,y-130+i*12,x+34,y-128+i*12,.1)}});
    spot('papers',px,y-94*k,o=>peekCat(px,y-86*k,S(o,40),o));
    add('paper',2.2,q=>q.rect(x-48,y-94*k,96,94*k,.3));
    add('none',1,q=>{for(let i=1;i<4;i++)q.line(x-48,y-94*k+i*22*k,x+48,y-94*k+i*22*k,.2)});
  }

  function cafe(){
    const cei=kCeiling();
    // lampy se kreslí až nakonec, ale místa se určí hned, ať jim obrazy a kočky na stěně uhnou
    {const bs=shuffle(cei.beams.slice());for(const xb of bs){if(LAMPS.length>=10)break;const ty=rr(30,CY+DP-6),x=cei.X(xb,ty);if(x<70||x>W-70)continue;
      const hg=LAMPS.length<3;LAMPS.push([x,ty,hg?rr(440,600):rr(430,660),hg?-1:R()])}}
    wallpaper();wainscot();kFloor();
    const WIN=rr(700,780),CNT=rr(1000,1100),SAL=W-260-WIN-CNT,wd={win:WIN,cnt:CNT,sal:SAL};
    const ord=pick([['win','cnt','sal'],['sal','cnt','win'],['win','sal','cnt'],['cnt','sal','win']]),sec={},pils=[18,W-18];
    {let x=60;for(let i=0;i<3;i++){const k=ord[i];sec[k]=[x,x+wd[k]];x+=wd[k];if(i<2){pils.push(x+35);x+=70}}}
    for(let i=0;i<pils.length;i++)pilaster(pils[i],i>1);
    const objs=[],taken=TAKEN;
    // w = šířka celé sestavy (stůl i se židlemi), h = skutečná výška kresby, o = „průhledný“ nábytek z čar
    // (stoly se židlemi, vozík) – s takovým se nic nesmí v hloubce překrýt, jinak se čáry prolínají
    // a drobnosti „leží“ na židlích;
    // c = jaký podíl výšky zadního předmětu smí zakrýt předmět před ním
    // g = vodorovná mezera kolem předmětu (platí větší z obou); drobnosti mají větší, ať se nehloučí
    const hit=(x,y,w,h,o,c,g)=>taken.some(t=>{if(Math.abs(t.x-x)>=(t.w+w)/2+Math.max(g,t.g||14))return false;const dy=y-t.y;if(Math.abs(dy)<60)return true;
      const[fr,bk]=dy>0?[{y,h,o},t]:[t,{y,h,o,c}],ov=bk.y-(fr.y-fr.h);return ov>(fr.o||bk.o?0:bk.c*bk.h)});
    const put=(f,x,y,w,h=150,o=0,c=.3,g=14)=>{if(hit(x,y,w,h,o,c,g))return false;taken.push({x,y,w,h,o,c,g});objs.push({f,x,y});return true};
    const tryPut=(f,w,h,y0,y1,o=0,c=.3,g=14,a=w/2+20,b=W-w/2-20)=>{for(let i=0;i<14;i++)if(put(f,rr(a,b),rr(y0,y1),w,h,o,c,g))return true;return false};
    // výloha
    const[g0,g1]=shopWin(...sec.win);
    if(R()<.6){const s=R()<.5;put(bigPlant,s?sec.win[0]+50:sec.win[1]-50,FY+30,100)}
    // pult
    counterSec(...sec.cnt,put);
    // salonek
    const ft=[],[a0,a1]=salon(...sec.sal,put,ft);
    ledge(...sec.sal);gallery(...sec.sal,ft);
    // koberec a křesla v salonku
    const ax=(a0+a1)/2+rr(-60,60),ay=FY+rr(290,340);
    rug(ax,ay-170,ay+36,Math.min(560,a1-a0+120));
    put(armSet,ax,ay,470,215,0,.15);
    // vozík s dorty (z čar jako stolky) dostane místo před nimi
    tryPut(trolley,200,240,FY+200,H-40,1,.15);
    const T=[[bistro,310],[bistro,310],[bistro,310],[clothT,330],[clothT,330]];
    // stolky ve třech řadách, s náhodnými mezerami a posunem
    for(let r=0;r<3;r++){const ry=FY+250+r*175;for(let x=rr(20,r%2?260:120);x<W-180;){const[f,w0]=pick(T),w=w0*dsc(ry),cx=x+w/2;
      if(cx+w/2<W-10&&put(f,cx,ry+rr(-18,18),w,235*dsc(ry),1,.2))x+=w+rr(40,170);else x+=rr(50,110)}}
    // drobnosti na podlaze do mezer mezi stolky
    for(const[f,w,h,o]of[[sacks,190,110],[catbed,230,120],[papers,110,150],[crates,150,160],[box,130,110]])for(let i=0;i<6&&!tryPut(f,w,h,FY+150,H-40,o,.3,70);i++);
    // mezery mezi řadami zaplní další stolky, pokud se vejdou celé i se židlemi
    for(let i=0;i<7;i++){const[f,w0]=pick(T),y=rr(FY+240,H-50),w=w0*dsc(y);tryPut(f,w,235*dsc(y),y,y,1,.2)}
    place(objs);
    // lampy visí z trámů
    for(const[x,ty,by,t]of LAMPS)if(t<0)hanger(x,ty,by);else lamp(x,ty,by,t);
  }

  cafe();
}});
