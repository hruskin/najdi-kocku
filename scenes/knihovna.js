// Knihovna: dvoupatrová síň s ochozem a točitým schodištěm, kazetový strop s lustry, regály s variantami,
// vitráže, krb, okna s lavicí, čítárna, výpůjční pult a parkety v perspektivě s kobercem.
// Prostředí se registruje přes SCENE(); build(K) dostane sdílené nástroje z jádra (index.html).
SCENE({id:"knihovna",ver:3,name:"Knihovna",where:"v regálech, za hromádkami knih, v křeslech i pod stoly",
  // kolik koček smí mít jeden druh úkrytu (neuvedený druh = 1)
  caps:{balcony:2,railing:1,chandelier:1,upwin:2,upshelf:2,shelftop:1,shelf:3,books:2,cupboard:1,ladder:1,stairs:2,understairs:1,landing:1,
    sill:1,curtain:1,winseat:1,clock:1,niche:1,mantel:1,hearth:1,portrait:1,desk:1,booktable:2,undertable:1,tablechair:1,tabletop:1,
    chair:2,seat:2,catalog:1,catalogtop:1,cart:1,globe:1,map:1,pile:2,plant:1,step:1,ottoman:1,box:1,rug:1},
build(K){
  const{R,rr,add,spot,S,reg,head,sitCat,loafCat,sleepCat,peekCat,pick,arch,place,box,yarn}=K;
  // BY podlaha ochozu, SB spodek ochozu, FY podlaha přízemí, RAIL kolejnice žebříků
  const BY=600,SB=650,FY=1400,RAIL=SB+44,VX=1500,VY=560,D=H+10;
  // hlava vykukující zpoza hrany ey: brada o pětinu velikosti pod hranou (kotě se neschová víc než dospělá)
  const pk=(x,ey,s,o)=>peekCat(x,ey+s*.18,s,o);
  const xa=(xb,y)=>VX+(xb-VX)*(y-VY)/(D-VY);   // perspektiva podlahy: x na zadní stěně → x v hloubce y

  /* ---------- strop, lustry ---------- */
  function ceiling(){
    add('none',1.2,q=>{for(let x=14;x<W;x+=160){q.rect(x,22,136,106,.5);q.rect(x+14,36,108,78,.4)}});
    add('paper',1.2,q=>{for(let x=14;x<W;x+=160)q.ell(x+68,75,13,13,.08)});
    add('none',1,q=>{for(let x=14;x<W;x+=160)for(let k=0;k<8;k++){const a=k/8*6.283;q.line(x+68+Math.cos(a)*16,75+Math.sin(a)*16,x+68+Math.cos(a)*27,75+Math.sin(a)*27,.2)}});
    add('none',2.2,q=>{q.line(-10,140,W+10,140,1);q.line(-10,156,W+10,156,1)});
    add('paper',1.1,q=>{for(let x=6;x<W;x+=26)q.rect(x,160,14,12,.2)});
    add('none',1.6,q=>q.line(-10,176,W+10,176,.6));
  }
  function candle(cx,cy){
    add('paper',1.3,q=>q.rect(cx-4,cy-22,8,22,.2));
    add('none',1.1,q=>q.curve([[cx,cy-24],[cx-4,cy-30],[cx,cy-40],[cx+4,cy-30]],true));
  }
  // lustr: obruč se svíčkami, nebo dvě patra s ověsem; kočka leží v míse uprostřed
  function chandelier(x,len){const y=176+len,rw=rr(80,100);
    add('none',1.1,q=>{for(let yy=178;yy<y-44;yy+=15)q.ell(x,yy+7,3.5,7,.1)});
    if(R()<.5){const cs=[];for(let k=0;k<6;k++){const a=k/6*6.283+.3;cs.push([x+Math.cos(a)*rw,y+Math.sin(a)*rw*.22,Math.sin(a)])}
      for(const c of cs)if(c[2]<0)candle(c[0],c[1]);
      add('none',1.6,q=>{for(const c of cs)q.line(x,y-40,c[0],c[1],.2)});
      add('none',2.6,q=>q.ell(x,y,rw,rw*.22,.02));
      add('paper',1.8,q=>q.ell(x,y+6,28,12,.05));
      spot('chandelier',x,y,o=>loafCat(x,y+4,S(o,34),o));
      for(const c of cs)if(c[2]>=0)candle(c[0],c[1]);
    }else{
      add('none',2,q=>{for(const sd of[-1,1]){q.curve([[x,y-6],[x+sd*rw*.6,y+26],[x+sd*rw,y-6]],false);q.curve([[x,y-54],[x+sd*rw*.35,y-34],[x+sd*rw*.58,y-50]],false)}});
      add('paper',1.8,q=>q.ell(x,y+6,28,12,.05));
      spot('chandelier',x,y,o=>loafCat(x,y+4,S(o,34),o));
      for(const sd of[-1,1]){candle(x+sd*rw,y-6);candle(x+sd*rw*.58,y-50)}
      add('none',.9,q=>{for(let k=-4;k<=4;k++){if(!k)continue;const px=x+k*rw/4.6,py=y+22-Math.abs(k)*5;q.line(px,py-10,px,py,.1)}});
      add('paper',1,q=>{for(let k=-4;k<=4;k++){if(!k)continue;q.ell(x+k*rw/4.6,y+26-Math.abs(k)*5,3,5,.1)}});
    }
    add('none',1.2,q=>q.line(x,y+18,x,y+30,.1));add('paper',1.2,q=>q.ell(x,y+36,5,8,.1));
  }

  /* ---------- drobnosti na policích ---------- */
  function shelfObj(x,by,rh,v){
    if(v<.2){const r=Math.min(rh*.24,22),cy=by-12-r;   // globus
      add('paper',1.4,q=>{q.ell(x,by-3,14,4,.1);q.rect(x-2,by-12,4,10,.1)});
      add('paper',1.6,q=>q.ell(x,cy,r,r,.04));
      add('none',1,q=>{q.ell(x,cy,r*.4,r,.05);q.line(x-r,cy,x+r,cy,.2);q.curve([[x-r-5,cy+r*.4],[x-r*.8,cy-r*1.1],[x+r*.3,cy-r-6]],false)})}
    else if(v<.4){const s=Math.min(1,rh/140);   // busta
      add('paper',1.6,q=>{q.rect(x-10*s,by-12*s,20*s,12*s,.2);q.curve([[x-26*s,by-12*s],[x-22*s,by-36*s],[x,by-44*s],[x+22*s,by-36*s],[x+26*s,by-12*s]],true)});
      add('paper',1.6,q=>q.ell(x,by-62*s,14*s,18*s,.04));
      add('none',1,q=>q.curve([[x-13*s,by-68*s],[x-4*s,by-82*s],[x+10*s,by-80*s],[x+14*s,by-66*s]],false))}
    else if(v<.6){   // květináč s břečťanem přes okraj police
      add('none',1.2,q=>{for(const sd of[-1,1])q.curve([[x+sd*8,by-26],[x+sd*24,by-10],[x+sd*26,by+30],[x+sd*20,by+62]],false)});
      add('paper',1.1,q=>{for(const sd of[-1,1])for(let k=0;k<4;k++)q.ell(x+sd*(22+(k%2)*6),by-4+k*18,6,4,.1,sd*.6)});
      add('paper',1.6,q=>q.poly([[x-16,by-28],[x+16,by-28],[x+12,by],[x-12,by]],true,.2));
      add('paper',1.2,q=>{for(let k=0;k<4;k++)q.ell(x-9+k*6,by-34-(k%2)*6,7,4,.1,k-1.5)})}
    else if(v<.8){   // váza
      add('paper',1.6,q=>q.poly([[x-9,by],[x+9,by],[x+16,by-26],[x+7,by-44],[x+9,by-52],[x-9,by-52],[x-7,by-44],[x-16,by-26]],true,.3));
      add('none',1,q=>{q.line(x-14,by-24,x+14,by-24,.2);q.line(x-12,by-18,x+12,by-18,.2)})}
    else{   // přesýpací hodiny
      add('paper',1.4,q=>{q.rect(x-16,by-6,32,6,.2);q.rect(x-16,by-58,32,6,.2)});
      add('none',1.4,q=>{q.poly([[x-12,by-52],[x+12,by-52],[x,by-29]],true,.2);q.poly([[x-12,by-6],[x+12,by-6],[x,by-29]],true,.2);q.line(x-13,by-52,x-13,by-6,.2);q.line(x+13,by-52,x+13,by-6,.2)})}
  }
  // jedna řada knih (by = horní hrana police, rh = volná výška řady); mezery a nízké knihy jsou úkryty
  function bookRow(x0,x1,by,rh,sk,gapP){
    const stand=[],lie=[],lean=[],bands=[],objs=[];let gx=-1e9,gw=0,hx=-1e9,hw=0,ht=by;
    if(x1-x0>220){if(R()<gapP){gw=rr(100,130);gx=rr(x0+30,x1-30-gw)}else if(R()<gapP*.7){hw=rr(72,90);hx=rr(x0+30,x1-30-hw)}}
    let bx=x0+2,nObj=0;
    while(bx<x1-12){
      if(bx+12>gx&&bx<gx+gw){bx=gx+gw+2;continue}
      if(bx+12>hx&&bx<hx+hw){const n=Math.floor(rr(2,4));for(let k=0;k<n;k++)lie.push([hx+rr(-3,3),by-(k+1)*10,hw-rr(0,10),10]);ht=by-n*10;bx=hx+hw+3;continue}
      // místo jen do mezery nebo hromádky, ať do ní nezasahuje ležící kniha a nezakryje kočku
      const lim=Math.min(x1-12,bx<gx?gx-2:1e9,bx<hx?hx-3:1e9);if(lim-bx<11){bx=lim+1;if(bx>=x1-12)break;continue}
      const u=R(),room=lim-bx;
      if(u<.07&&room>70){const w=rr(44,62),n=Math.floor(rr(2,5));for(let k=0;k<n;k++)lie.push([bx+rr(-3,3),by-(k+1)*10,w+rr(-6,6),10]);bx+=w+8;continue}
      if(u<.12&&room>70){const h=rh*rr(.55,.72),w=rr(14,20),dd=h*.4;lean.push([[bx,by],[bx+w,by],[bx+w+dd,by-h],[bx+dd,by-h+4]]);bx+=w+dd+2;continue}
      if(u<.155&&room>64&&nObj<1){objs.push([bx+30,R()]);nObj++;bx+=62;continue}
      const w=Math.min(rr(11,24),room),h=rh*rr(.55,.88);stand.push([bx,by-h,w,h]);if(w>15&&h>40&&R()<.5)bands.push([bx,by-h,w,h]);bx+=w+(R()<.2?rr(1,4):0);
    }
    if(by>FY-260){if(gw)lowX.push(gx+gw/2);if(hw)lowX.push(hx+hw/2)}
    if(gw){const cx=gx+gw/2,hm=rh-8;spot(sk,cx,by,o=>o.alt?loafCat(cx,by,Math.min(S(o,44),hm),o):sleepCat(cx,by,Math.min(S(o,50),hm/.75),o))}
    if(hw){const cx=hx+hw/2,t=ht;spot('books',cx,t,o=>pk(cx+o.dir*4,t,Math.min(S(o,42),(rh-by+t)*1.05),o))}
    if(stand.length+lie.length+lean.length)add('paper',1.2,q=>{for(const b of stand)q.rect(b[0],b[1],b[2],b[3],.3);for(const b of lie)q.rect(b[0],b[1],b[2],b[3],.3);for(const p of lean)q.poly(p,true,.3)});
    if(bands.length)add('none',.9,q=>{for(const b of bands){q.line(b[0]+2,b[1]+8,b[0]+b[2]-2,b[1]+8,.15);q.line(b[0]+2,b[1]+b[3]-9,b[0]+b[2]-2,b[1]+b[3]-9,.15)}});
    for(const[ox,v]of objs)shelfObj(ox,by,rh,v);
  }
  // skříňka ve spodku regálu, občas s pootevřenými dvířky
  function cabinet(x,w,top,bot){const n=w>340?3:2,dw=(w-16)/n,ai=R()<.55?Math.floor(R()*n):-1;
    add('paper',2,q=>q.rect(x,top,w,bot-top,.4));
    add('paper',1.6,q=>q.rect(x-6,top-10,w+12,12,.3));
    for(let i=0;i<n;i++){const dx=x+8+i*dw;
      if(i===ai){const hs=i<n/2?-1:1,hx=hs<0?dx:dx+dw,cx=dx+dw/2;
        add('shade',1.4,q=>q.rect(dx+2,top+8,dw-4,bot-top-16,.3));
        lowX.push(cx);spot('cupboard',cx,bot-10,o=>peekCat(cx+hs*6,bot-10,S(o,42),o));
        add('paper',1.8,q=>q.poly([[hx,top+6],[hx-hs*dw*.34,top-6],[hx-hs*dw*.34,bot+6],[hx,bot-8]],true,.3));
        add('none',1,q=>q.poly([[hx-hs*6,top+18],[hx-hs*dw*.28,top+10],[hx-hs*dw*.28,bot-10],[hx-hs*6,bot-18]],true,.2))}
      else{add('none',1.2,q=>{q.rect(dx+2,top+8,dw-4,bot-top-16,.3);q.rect(dx+14,top+20,dw-28,bot-top-40,.3)});
        add('ink',0,q=>q.ell(i<n/2?dx+dw-12:dx+12,(top+bot)/2,3,3,.1))}}
  }
  // regál: tmavé nitro, řady knih, police, boky; nahoře (ochoz) s nástavcem, dole s podstavcem a skříňkou
  function bookcase(x,w,top,bot,sk,up){
    const cab=!up&&R()<.45,base=up?bot:bot-34,sb=cab?base-rr(150,180):base,
      rows=Math.max(2,Math.round((sb-top-16)/rr(125,145))),rh=(sb-top-16)/rows,boards=[];
    add('shade',1.8,q=>q.rect(x,top,w,bot-top,.5));
    for(let r=0;r<rows;r++){const by=top+16+rh*(r+1)-12,hidden=up&&by>BY-90;
      bookRow(x+10,x+w-10,by,rh-12,sk,hidden?0:up?.3:.36);boards.push(by)}
    add('paper',1.8,q=>{for(const by of boards)q.rect(x,by,w,12,.5)});
    if(cab)cabinet(x+8,w-16,sb+10,base);
    add('paper',2.2,q=>{q.rect(x-8,top,16,bot-top,.4);q.rect(x+w-8,top,16,bot-top,.4)});
    if(!up){add('paper',2.2,q=>{q.rect(x-12,base,w+24,bot-base,.4);q.rect(x-12,top-18,w+24,20,.4)});
      add('none',1,q=>{q.line(x-6,base+10,x+w+6,base+10,.3);q.line(x-6,top-8,x+w+6,top-8,.3)});return}
    const ct=R(),tsp=(tx,ty)=>spot('shelftop',tx,ty,o=>loafCat(tx,ty+1,S(o,40),o));
    if(ct<.34){add('paper',2.2,q=>q.rect(x-12,top-20,w+24,20,.4));add('paper',1,q=>{for(let k=x+6;k<x+w-4;k+=22)q.rect(k,top-2,12,8,.1)});tsp(x+w*rr(.2,.8),top-20)}
    else if(ct<.67){add('paper',2.2,q=>q.rect(x-12,top-16,w+24,16,.4));
      add('paper',2,q=>q.poly([[x+w*.24,top-16],[x+w/2,top-54],[x+w*.76,top-16]],true,.4));
      add('none',1,q=>q.ell(x+w/2,top-30,7,7,.1));tsp(x+w*(R()<.5?.1:.9),top-16)}
    else{add('paper',2.2,q=>q.rect(x-12,top-16,w+24,16,.4));
      add('paper',2,q=>q.curve([[x+w*.3,top-14],[x+w*.33,top-42],[x+w/2,top-56],[x+w*.67,top-42],[x+w*.7,top-14]],true));
      add('none',1,q=>{q.ell(x+w/2,top-32,14,10,.08);q.curve([[x+w*.3,top-18],[x+w*.24,top-30],[x+w*.2,top-20]],false);q.curve([[x+w*.7,top-18],[x+w*.76,top-30],[x+w*.8,top-20]],false)});
      tsp(x+w*(R()<.5?.1:.9),top-16)}
  }

  /* ---------- ochoz (horní patro) ---------- */
  // okno s vitráží: kosočtverečná mříž, růžice, nebo medailon s lemem
  function vitraz(x,w){const cx=x+w/2,r=w/2-16,top=rr(204,222),sill=BY-150,sp=top+r,t=R(),sx=cx+rr(-.4,.4)*r;
    add('paper',2.4,q=>q.poly(arch(cx,top-14,r+14,sill+4),true,.5));
    add('shade',1.6,q=>q.poly(arch(cx,top,r,sill),true,.4));
    if(t<.34){const a=r/3,L=[],Pn=[];
      for(let j=0;;j++){const y=sp+a+j*a;if(y+a>sill)break;for(let i=-4;i<=4;i++){const px=cx+(i+(j%2)*.5)*2*a;if(Math.abs(px-cx)>r-a+1)continue;((i+j)%3===0?Pn:L).push([px,y])}}
      const dm=(q,p)=>q.poly([[p[0],p[1]-a],[p[0]+a,p[1]],[p[0],p[1]+a],[p[0]-a,p[1]]],true,.2);
      add('paper',1,q=>{for(const p of Pn)dm(q,p)});add('none',1,q=>{for(const p of L)dm(q,p)});
      add('none',1,q=>{for(let k=1;k<6;k++){const an=Math.PI+k/6*Math.PI;q.line(cx,sp,cx+Math.cos(an)*r,sp+Math.sin(an)*r,.2)}q.ell(cx,sp,r*.25,r*.25,.05)})}
    else if(t<.67){
      add('paper',1.2,q=>q.ell(cx,sp,r*.36,r*.36,.03));
      add('paper',1,q=>{for(let k=0;k<8;k++){const an=k/8*6.283;q.ell(cx+Math.cos(an)*r*.6,sp+Math.sin(an)*r*.6,r*.16,r*.16,.05)}});
      add('none',1,q=>{q.ell(cx,sp,r*.14,r*.14,.05);for(let k=0;k<8;k++){const an=k/8*6.283+.39;q.line(cx+Math.cos(an)*r*.36,sp+Math.sin(an)*r*.36,cx+Math.cos(an)*r*.95,sp+Math.sin(an)*r*.95,.2)}});
      const y0=sp+r*.85,cw=2*r/3;
      add('paper',1,q=>{for(let y=y0,j=0;y<sill-30;y+=46,j++)for(let i=0;i<3;i++)if((i+j)%2===0)q.rect(cx-r+i*cw+6,y+6,cw-12,34,.2)});
      add('none',1,q=>{q.line(cx-r/3,y0,cx-r/3,sill,.2);q.line(cx+r/3,y0,cx+r/3,sill,.2)})}
    else{const my=(sp+sill)/2;
      add('paper',1.3,q=>q.ell(cx,my,r*.5,(sill-top)*.28,.03));
      add('none',1.2,q=>{q.poly([[cx,my-r*.34],[cx+r*.1,my-r*.08],[cx+r*.34,my],[cx+r*.1,my+r*.08],[cx,my+r*.34],[cx-r*.1,my+r*.08],[cx-r*.34,my],[cx-r*.1,my-r*.08]],true,.2)});
      add('paper',1,q=>{for(let y=sp+10;y<sill-24;y+=34){q.rect(cx-r+4,y,14,20,.1);q.rect(cx+r-18,y,14,20,.1)}});
      add('none',1,q=>{for(let k=1;k<8;k++){const an=Math.PI+k/8*Math.PI;q.line(cx+Math.cos(an)*r*.5,sp+Math.sin(an)*r*.5,cx+Math.cos(an)*r,sp+Math.sin(an)*r,.2)}})}
    add('none',1.4,q=>{for(let y=sp+60;y<sill-20;y+=90)q.line(cx-r,y,cx+r,y,.3)});
    add('paper',2,q=>q.rect(x+2,sill,w-4,14,.4));
    spot('upwin',sx,sill,o=>sitCat(sx,sill+1,S(o,44),o));
  }
  function gallery(){
    add('none',1,q=>{let r=0;for(let y=214;y<BY;y+=76,r++)for(let x=(r%2)*48;x<W;x+=96){q.curve([[x-7,y],[x,y-10],[x+7,y],[x,y+10]],true);q.ell(x+48,y,2,2,.1)}});
    let x=rr(10,40),win=R()<.5;
    while(x<W-150){
      if(win){const w=rr(180,220);if(x+w>W-20)break;vitraz(x,w);x+=w}
      else{const w=Math.min(rr(300,420),W-24-x);if(w<200)break;bookcase(x,w,rr(238,262),BY,'upshelf',true);x+=w}
      const g=rr(50,70);if(x+g<W-20){const px=x+g/2;add('paper',1.8,q=>{q.rect(px-14,190,28,BY-190,.4);q.rect(px-20,178,40,16,.3)});add('none',1,q=>{q.line(px-5,200,px-5,BY-10,.3);q.line(px+5,200,px+5,BY-10,.3)})}
      x+=g;win=!win}
  }
  // zábradlí ochozu s otvorem pro schodiště; kočky vykukují přes madlo nebo leží na něm
  function balustrade(sx){const g0=sx-70,g1=sx+70;
    const posts=[g0-14,g1+14];for(let x=rr(200,380);x<W-60;x+=rr(480,600))if(x<g0-120||x>g1+120)posts.push(x);
    for(let x=rr(60,120);x<W-60;x+=rr(105,140)){if(x>g0-90&&x<g1+90||posts.some(p=>Math.abs(p-x)<50))continue;const xx=x;spot('balcony',xx,BY,o=>pk(xx,BY-84,S(o,46),o))}
    add('paper',1.6,q=>{for(let x=16;x<W;x+=32){if(x>g0-8&&x<g1+8)continue;q.poly([[x-6,BY],[x+6,BY],[x+4,BY-10],[x+10,BY-30],[x+4,BY-50],[x+6,BY-66],[x-6,BY-66],[x-4,BY-50],[x-10,BY-30],[x-4,BY-10]],true,.3)}});
    add('paper',2.2,q=>{q.rect(-10,BY-84,g0+10,18,.5);q.rect(g1,BY-84,W+10-g1,18,.5)});
    add('paper',2,q=>{for(const p of posts){q.rect(p-16,BY-96,32,96,.4);q.rect(p-20,BY-104,40,10,.3)}});
    add('paper',1.6,q=>{for(const p of posts)q.ell(p,BY-116,10,12,.08)});
    for(let i=0;i<6;i++){const x=rr(100,W-100);if(x>g0-60&&x<g1+60)continue;spot('railing',x,BY-84,o=>loafCat(x,BY-83,S(o,40),o))}
    // čelo ochozu
    add('paper',2.4,q=>q.rect(-10,BY,W+20,SB-BY,.8));
    add('none',1,q=>{q.line(-10,BY+12,W+10,BY+12,.5);q.line(-10,SB-10,W+10,SB-10,.5);for(let x=40;x<W;x+=80){q.ell(x,BY+30,6,6,.1);q.line(x+30,BY+22,x+50,BY+38,.2);q.line(x+50,BY+22,x+30,BY+38,.2)}});
  }

  /* ---------- přízemí: stěna ---------- */
  function pilaster(x){
    add('paper',2,q=>{q.rect(x-18,SB+24,36,FY-SB-54,.4);q.rect(x-24,SB,48,24,.3);q.rect(x-24,FY-32,48,32,.3)});
    add('none',1,q=>{for(const k of[-8,0,8])q.line(x+k,SB+34,x+k,FY-42,.3);q.curve([[x-24,SB+20],[x-30,SB+10],[x-22,SB+4]],false);q.curve([[x+24,SB+20],[x+30,SB+10],[x+22,SB+4]],false)});
  }
  // obraz: krajina, loď, portrét učence nebo portrét kočky; dva druhy rámu
  function painting(cx,top,w,h,catOk){const x=cx-w/2,t=R();
    if(R()<.5){add('paper',2.6,q=>q.rect(x-22,top-22,w+44,h+44,.6));add('none',1,q=>{q.rect(x-14,top-14,w+28,h+28,.4);q.rect(x-6,top-6,w+12,h+12,.3)});
      add('paper',1.4,q=>{for(const[px,py]of[[x-18,top-18],[x+w+18,top-18],[x-18,top+h+18],[x+w+18,top+h+18]])q.ell(px,py,8,8,.1)})}
    else{add('paper',2.4,q=>q.rect(x-12,top-12,w+24,h+24,.6));add('none',1,q=>q.rect(x-5,top-5,w+10,h+10,.3))}
    add('shade',1.4,q=>q.rect(x,top,w,h,.4));
    if(t<.3){add('paper',1.3,q=>q.poly([[x+3,top+h*.66],[x+w*.24,top+h*.4],[x+w*.42,top+h*.54],[x+w*.66,top+h*.3],[x+w-3,top+h*.5],[x+w-3,top+h*.66]],true,.5));
      add('paper',1.2,q=>q.ell(x+w*.78,top+h*.2,Math.min(w,h)*.07,Math.min(w,h)*.07,.05));
      add('none',1,q=>{for(let i=0;i<3;i++)q.line(x+w*(.15+i*.1),top+h*(.76+i*.07),x+w*(.6-i*.05),top+h*(.76+i*.07),.3)})}
    else if(t<.55){const bx=x+w*rr(.35,.65),by=top+h*.62;
      add('none',1.1,q=>{for(let i=0;i<4;i++){const yy=top+h*(.68+i*.08),pts=[];for(let k=0;k<=6;k++)pts.push([x+4+(w-8)*k/6,yy+(k%2?-4:3)]);q.curve(pts,false)}});
      add('paper',1.3,q=>{q.poly([[bx-w*.16,by-6],[bx+w*.16,by-6],[bx+w*.11,by+8],[bx-w*.11,by+8]],true,.3);q.poly([[bx-3,by-8],[bx-3,by-h*.44],[bx-w*.14,by-10]],true,.3);q.poly([[bx+3,by-8],[bx+3,by-h*.36],[bx+w*.12,by-8]],true,.3)})}
    else if(t<.8||!catOk){
      add('paper',1.5,q=>q.curve([[cx-w*.36,top+h*.98],[cx-w*.3,top+h*.72],[cx,top+h*.62],[cx+w*.3,top+h*.72],[cx+w*.36,top+h*.98]],false));
      add('paper',1.5,q=>q.ell(cx,top+h*.42,w*.14,h*.17,.05));
      add('none',1.2,q=>{q.curve([[cx-w*.15,top+h*.4],[cx-w*.17,top+h*.2],[cx,top+h*.2],[cx+w*.17,top+h*.22],[cx+w*.15,top+h*.44]],false);q.rect(cx+w*.12,top+h*.74,w*.16,h*.12,.2);q.ell(cx-w*.05,top+h*.46,3,2,.1);q.ell(cx+w*.05,top+h*.46,3,2,.1)})}
    else{const pr=Math.min(w,h)*.15,px=x+w*rr(.38,.62),py=top+h*rr(.48,.6);
      add('none',1.1,q=>{q.curve([[x+w*.08,top+h*.06],[x+w*.2,top+h*.5],[x+w*.08,top+h*.94]],false);q.curve([[x+w*.92,top+h*.06],[x+w*.8,top+h*.5],[x+w*.92,top+h*.94]],false);q.line(x+w*.1,top+h*.84,x+w*.9,top+h*.84,.3)});
      spot('portrait',px,py,o=>{head(px,py,pr,o);reg(o,px,py-pr*.3,pr*1.3)})}
  }
  function bookBay(x,w){bookcase(x,w,SB+28,FY,'shelf',false);shelfBays.push([x,w])}
  // okno s vitrážovým obloukem, závěsy a lavicí v okně
  function winBay(x,w){const cx=x+w/2,r=w/2-40,top=SB+rr(70,100),sill=FY-rr(260,300),sp=top+r,sx=cx+rr(-.4,.4)*r*.6,seatY=FY-110,wx=cx+rr(-.3,.3)*r,pd=R()<.5?-1:1;
    add('none',1,q=>{for(let px=x+14;px<x+w-40;px+=Math.max(60,(w-28)/4))q.rect(px,SB+30,Math.max(50,(w-28)/4-10),FY-SB-60,.4)});
    add('paper',2.4,q=>q.poly(arch(cx,top-16,r+16,sill+6),true,.5));
    add('shade',1.6,q=>q.poly(arch(cx,top,r,sill),true,.4));
    if(R()<.6){const tx=cx+rr(-.3,.3)*r;add('paper',1.2,q=>q.rect(tx-5,sill-70,10,70,.3));
      add('paper',1.2,q=>q.curve([[tx-50,sill-70],[tx-58,sill-104],[tx-30,sill-128],[tx-8,sill-146],[tx+26,sill-134],[tx+54,sill-112],[tx+50,sill-76],[tx+10,sill-62]],true));
      add('none',1,q=>{for(let k=0;k<6;k++){const px=tx-30+(k%3)*28,py=sill-120+Math.floor(k/3)*26;q.curve([[px-6,py],[px,py-5],[px+6,py]],false)}})}
    else add('paper',1.2,q=>{q.poly([[cx-r,sill],[cx-r,sill-60],[cx-r*.5,sill-90],[cx,sill-60],[cx,sill-100],[cx+r*.6,sill-100],[cx+r*.6,sill-70],[cx+r,sill-70],[cx+r,sill]],true,.4)});
    add('none',1.5,q=>{q.line(cx,top,cx,sill,.3);for(let y=sp+20;y<sill-20;y+=90)q.line(cx-r,y,cx+r,y,.3);for(let k=1;k<6;k++){const an=Math.PI+k/6*Math.PI;q.line(cx,sp,cx+Math.cos(an)*r,sp+Math.sin(an)*r,.2)}});
    add('paper',1.2,q=>q.ell(cx,sp,r*.22,r*.22,.05));
    add('paper',2,q=>q.rect(cx-r-24,sill,2*r+48,14,.4));
    spot('sill',sx,sill,o=>sitCat(sx,sill+1,S(o,44),o));
    add('paper',2.2,q=>q.rect(cx-r-20,seatY,2*r+40,FY-seatY,.5));
    add('none',1,q=>{const n=3,pw=(2*r+20)/n;for(let i=0;i<n;i++)q.rect(cx-r-10+i*pw+6,seatY+22,pw-12,FY-seatY-40,.3)});
    add('paper',2,q=>q.rect(cx-r-14,seatY-18,2*r+28,20,.6));
    add('paper',1.6,q=>q.curve([[cx+pd*(r-4),seatY-16],[cx+pd*(r-10),seatY-56],[cx+pd*(r-40),seatY-50],[cx+pd*(r-44),seatY-16]],true));
    lowX.push(wx,cx-r+10,cx+r-10);
    spot('winseat',wx,seatY-16,o=>sleepCat(wx,seatY-15,S(o,44),o));
    for(const sd of[-1,1]){const ex=cx+sd*(r+26),ix=cx+sd*(r-18),cs=R()<.5,ty=(top+seatY)/2+rr(-20,40);
      if(cs)spot('curtain',ix,seatY-16,o=>sitCat(ix,seatY-15,S(o,44),o));
      add('paper',2,q=>q.curve([[ex+sd*30,top-40],[ex-sd*36,top-40],[ex-sd*26,top+80],[ex-sd*4,ty],[ex-sd*30,seatY-60],[ex-sd*34,seatY-18],[ex+sd*30,seatY-18]],true));
      add('none',1,q=>{for(let k=-1;k<=1;k++){q.line(ex+k*12,top-30,ex+sd*4+k*4,ty-6,.5);q.line(ex+sd*4+k*4,ty+6,ex-sd*10+k*14,seatY-24,.5)}});
      add('paper',1.4,q=>q.ell(ex+sd*6,ty,20,7,.1))}
    add('none',2.2,q=>q.line(cx-r-66,top-40,cx+r+66,top-40,.3));
    add('paper',1.4,q=>{q.ell(cx-r-70,top-40,8,8,.1);q.ell(cx+r+70,top-40,8,8,.1)});
  }
  // stojací hodiny se třemi druhy hlavy
  function clock(cx,bot){const w=rr(84,100),h=rr(440,480),top=bot-h,t=R();let st=top-14,sxo=0;
    add('paper',2.2,q=>q.rect(cx-w/2+6,top+120,w-12,h-154,.5));
    add('paper',2.2,q=>{q.rect(cx-w/2-6,bot-34,w+12,34,.4);q.rect(cx-w/2-2,bot-44,w+4,12,.3)});
    add('shade',1.6,q=>q.rect(cx-20,top+160,40,h-240,.4));
    add('none',1.6,q=>q.line(cx,top+164,cx+5,top+300,.3));add('paper',1.6,q=>q.ell(cx+5,top+310,13,13,.05));
    add('paper',2.2,q=>q.rect(cx-w/2-8,top,w+16,122,.5));
    add('paper',1.8,q=>q.ell(cx,top+60,34,34,.03));
    add('none',1.3,q=>{q.ell(cx,top+60,26,26,.03);q.line(cx,top+60,cx,top+38,.2);q.line(cx,top+60,cx+17,top+66,.2);for(let i=0;i<12;i++){const a=i/12*6.283;q.line(cx+Math.cos(a)*28,top+60+Math.sin(a)*28,cx+Math.cos(a)*32,top+60+Math.sin(a)*32,.1)}});
    if(t<.34)add('paper',2.2,q=>q.rect(cx-w/2-16,top-14,w+32,16,.5));
    else if(t<.67){add('paper',2.2,q=>q.curve([[cx-w/2-12,top+2],[cx-w/2-8,top-26],[cx,top-44],[cx+w/2+8,top-26],[cx+w/2+12,top+2]],true));st=top-34}
    else{add('paper',2.2,q=>q.rect(cx-w/2-16,top-14,w+32,16,.5));
      add('none',2.2,q=>{q.curve([[cx-w/2-8,top-14],[cx-w/2+4,top-44],[cx-18,top-40],[cx-10,top-28]],false);q.curve([[cx+w/2+8,top-14],[cx+w/2-4,top-44],[cx+18,top-40],[cx+10,top-28]],false)});
      add('paper',1.6,q=>{q.rect(cx-5,top-40,10,26,.2);q.ell(cx,top-46,8,8,.1)});sxo=w*.3}
    const sx=cx+(R()<.5?-1:1)*sxo;
    spot('clock',sx,st,o=>o.alt||sxo?loafCat(sx,st+1,S(o,40),o):sitCat(sx,st+1,S(o,44),o));
  }
  function clockBay(x,w){const cx=x+w/2;
    add('none',1,q=>{q.rect(x+14,FY-260,w-28,220,.4);q.rect(x+26,FY-248,w-52,196,.3)});
    painting(cx,SB+rr(80,110),Math.min(w*.56,rr(100,130)),rr(100,120),false);
    clock(cx,FY);
  }
  function bustL(x,b){
    add('paper',2,q=>q.rect(x-18,b-20,36,20,.3));
    add('paper',2.2,q=>q.curve([[x-44,b-20],[x-40,b-60],[x,b-72],[x+40,b-60],[x+44,b-20]],true));
    add('paper',2.2,q=>q.ell(x,b-100,24,30,.04));
    add('none',1.2,q=>{q.curve([[x+2,b-104],[x+8,b-92],[x+2,b-90]],false);q.curve([[x-22,b-112],[x-8,b-132],[x+16,b-128],[x+24,b-110]],false);q.curve([[x-18,b-40],[x,b-30],[x+18,b-40]],false)});
  }
  function bustBay(x,w){const cx=x+w/2,r=w/2-32,top=SB+rr(120,170),bot=FY-rr(210,240),d=R()<.5?-1:1;
    add('none',1,q=>{q.rect(x+14,bot+40,w-28,FY-bot-80,.4);q.ell(cx,(bot+FY)/2,24,24,.05)});
    add('paper',2.4,q=>q.poly(arch(cx,top-16,r+16,bot),true,.5));
    add('shade',1.8,q=>q.poly(arch(cx,top,r,bot),true,.4));
    add('none',1,q=>{for(let k=1;k<8;k++){const a=Math.PI+k/8*Math.PI;q.line(cx,top+r,cx+Math.cos(a)*r*.9,top+r+Math.sin(a)*r*.9,.2)}});
    add('paper',2,q=>q.rect(cx-r-22,bot,2*r+44,16,.4));
    add('paper',2,q=>q.rect(cx-30,bot-40,60,40,.3));
    // ve výklenku busta, amfora, nebo glóbus; kočka vykukuje zpoza nich
    const t=R(),b=bot-40;
    if(t<.45){spot('niche',cx+d*30,b,o=>{const s=S(o,40);peekCat(cx+d*(26+s*.3),b-66,s,o)});bustL(cx,b)}
    else if(t<.75){spot('niche',cx+d*10,b,o=>pk(cx+d*12,b-95,S(o,40),o));
      add('paper',2.2,q=>q.poly([[cx-16,b],[cx+16,b],[cx+30,b-46],[cx+14,b-80],[cx+16,b-95],[cx-16,b-95],[cx-14,b-80],[cx-30,b-46]],true,.5));
      add('none',1.6,q=>{q.curve([[cx-15,b-82],[cx-30,b-84],[cx-26,b-60]],false);q.curve([[cx+15,b-82],[cx+30,b-84],[cx+26,b-60]],false);q.line(cx-26,b-40,cx+26,b-40,.3);q.line(cx-22,b-30,cx+22,b-30,.3)})}
    else{const r=38,cy=b-14-r;spot('niche',cx+d*r*.5,cy-r,o=>pk(cx+d*r*.5,cy-r,S(o,40),o));
      add('paper',1.8,q=>{q.ell(cx,b-4,22,5,.1);q.rect(cx-4,b-16,8,12,.1)});
      add('paper',2,q=>q.ell(cx,cy,r,r,.03));
      add('none',1,q=>{q.ell(cx,cy,r*.42,r,.05);q.line(cx-r,cy,cx+r,cy,.3);q.curve([[cx-r*.7,cy-r*.5],[cx-r*.2,cy-r*.7],[cx+r*.1,cy-r*.3],[cx+r*.5,cy-r*.45]],false)});
      add('none',2,q=>q.curve([[cx-r-8,cy+r*.5],[cx-r-6,cy-r*.6],[cx-r*.3,cy-r-8],[cx+r*.5,cy-r-5]],false))}
  }
  // krb: obklad, oblouk s poleny (zapálený nebo studený), římsa se svícny a obraz nad ním
  function fireplace(x,w){const cx=x+w/2,fw=w-50,h=rr(300,330),top=FY-h,ow=fw*.5,oh=h*.62,ot=FY-oh,lit=R()<.45,d=R()<.5?-1:1,
      mx=cx-d*fw*rr(.14,.26),px=cx+d*fw*.22,lx=cx+rr(-.08,.08)*ow,it=R();
    lowX.push(cx-ow*.4,cx,cx+ow*.4);
    add('none',1,q=>{q.rect(x+14,SB+30,w-28,FY-SB-h-80,.4)});
    painting(cx,SB+rr(80,100),rr(190,230),rr(150,170),true);
    add('paper',2.4,q=>q.rect(cx-fw/2,top,fw,h,.6));
    add('none',1,q=>{q.rect(cx-fw/2+14,top+14,36,h-14,.3);q.rect(cx+fw/2-50,top+14,36,h-14,.3);q.line(cx-fw/2+50,top+34,cx+fw/2-50,top+34,.3)});
    add('paper',1.8,q=>q.poly(arch(cx,ot-16,ow/2+16,FY),true,.4));
    add('shade',1.6,q=>q.poly(arch(cx,ot,ow/2,FY),true,.4));
    add('none',1,q=>{for(let k=0;k<5;k++){const a=Math.PI+(k+.5)/5*Math.PI;q.line(cx+Math.cos(a)*(ow/2),ot+ow/2+Math.sin(a)*(ow/2),cx+Math.cos(a)*(ow/2+16),ot+ow/2+Math.sin(a)*(ow/2+16),.2)}});
    add('paper',1.8,q=>q.poly([[cx-12,ot-18],[cx+12,ot-18],[cx+8,ot+8],[cx-8,ot+8]],true,.2));
    if(!lit)spot('hearth',lx+d*12,FY-34,o=>pk(lx+d*12,FY-44,S(o,40),o));
    add('none',2.4,q=>{for(const sd of[-1,1]){const ax=cx+sd*ow*.34;q.line(ax,FY,ax,FY-40,.2);q.line(ax-8,FY,ax+8,FY,.2)}});
    add('paper',1.8,q=>{q.ell(lx-14,FY-14,ow*.3,11,.08,-.06);q.ell(lx+16,FY-18,ow*.28,10,.08,.08);q.ell(lx,FY-32,ow*.24,10,.08,.02)});
    add('none',1,q=>{q.ell(lx-14-ow*.28,FY-14,4,7,.1);q.ell(lx+16+ow*.26,FY-18,4,6,.1)});
    if(lit){add('paper',1.6,q=>{for(const k of[-1,0,1]){const fx=lx+k*24,fh=k?54:78;q.curve([[fx-16,FY-38],[fx-18,FY-60],[fx-6,FY-38-fh*.7],[fx+2,FY-38-fh],[fx+6,FY-60],[fx+14,FY-58],[fx+16,FY-38]],true)}});
      add('none',1,q=>{for(const k of[-1,0,1])q.curve([[lx+k*24-5,FY-42],[lx+k*24,FY-62],[lx+k*24+3,FY-76+Math.abs(k)*14]],false)})}
    add('paper',2.4,q=>q.rect(cx-fw/2-26,top-22,fw+52,22,.5));
    add('none',1,q=>q.line(cx-fw/2-20,top-6,cx+fw/2+20,top-6,.3));
    for(const sd of[-1,1]){const sx=cx+sd*(fw/2+2);add('paper',1.6,q=>{q.ell(sx,top-26,14,5,.1);q.rect(sx-4,top-66,8,40,.2);q.ell(sx,top-68,10,4,.1)});candle(sx,top-70)}
    if(it<.4){add('paper',1.8,q=>{q.rect(px-26,top-30,52,8,.2);q.curve([[px-22,top-30],[px-24,top-66],[px,top-80],[px+24,top-66],[px+22,top-30]],true)});
      add('none',1.1,q=>{q.ell(px,top-56,13,13,.05);q.line(px,top-56,px,top-65,.1);q.line(px,top-56,px+7,top-54,.1)})}
    else if(it<.7){add('paper',1.6,q=>q.poly([[px-10,top-22],[px+10,top-22],[px+16,top-46],[px+8,top-62],[px-8,top-62],[px-16,top-46]],true,.3));
      add('none',1.2,q=>{for(let k=-2;k<=2;k++)q.curve([[px,top-60],[px+k*8,top-80],[px+k*16,top-96]],false)});
      add('paper',1.1,q=>{for(let k=-2;k<=2;k++)q.ell(px+k*16,top-98,6,6,.1)})}
    else add('paper',1.3,q=>{for(let k=0;k<4;k++)q.rect(px-26+(k%2)*4,top-22-(k+1)*10,52-k*3,10,.2)});
    spot('mantel',mx,top-22,o=>sitCat(mx,top-21,S(o,44),o));
    add('paper',1.8,q=>q.rect(cx-fw/2-12,FY-4,fw+24,20,.4));
    {const tx=cx-d*(ow/2+40);add('none',2,q=>{q.line(tx,FY-2,tx,FY-120,.2);q.line(tx-14,FY-2,tx+14,FY-2,.2);q.line(tx-6,FY-110,tx-10,FY-30,.2);q.line(tx+6,FY-110,tx+10,FY-30,.2)});
      add('paper',1.4,q=>{q.ell(tx,FY-124,6,6,.1);q.poly([[tx+6,FY-30],[tx+18,FY-26],[tx+10,FY-18]],true,.1)})}
  }
  // žebřík na kolejnici opřený o regál
  function ladder(x){const ty=RAIL-4,bx=x+rr(-36,36),by=FY+40,n=Math.floor((by-ty)/64),L=(t,s)=>[x+s*20+(bx-x+s*6)*t,ty+(by-ty)*t];
    add('none',2.6,q=>{for(const s of[-1,1]){const a=L(0,s),b=L(1,s);q.line(a[0],a[1],b[0],b[1],.4)}});
    add('none',1.8,q=>{for(let k=1;k<n;k++){const a=L(k/n,-1),b=L(k/n,1);q.line(a[0],a[1],b[0],b[1],.2)}});
    add('none',1.6,q=>{for(const s of[-1,1]){const a=L(0,s);q.curve([[a[0],a[1]+8],[a[0]-4,a[1]-8],[a[0]+6,a[1]-12],[a[0]+8,a[1]-2]],false)}});
    add('paper',1.6,q=>{for(const s of[-1,1]){const b=L(1,s);q.ell(b[0],b[1]-4,7,7,.05)}});
    const k=Math.floor(rr(3,n-2)),a=L(k/n,-1),b=L(k/n,1),rx=(a[0]+b[0])/2,ry=(a[1]+b[1])/2;
    if(ry>FY-260)lowX.push(rx);
    spot('ladder',rx,ry,o=>sitCat(rx,ry,S(o,42),o));
  }

  /* ---------- točité schodiště ---------- */
  function stairs(sx){const bot=FY+40,n=13,rise=(bot-BY)/n,Rr=128,ph=rr(0,6.28),tilt=.26,d=R()<.5?-1:1,
      P=(r,a,y)=>[sx+r*Math.sin(a),y+r*Math.cos(a)*tilt],st=[];
    for(let k=0;k<n;k++){const a=ph+k*.62;st.push({k,a,y:bot-(k+1)*rise,front:Math.cos(a)>0,cat:k>=1&&k<=n-3&&R()<.55})}
    const ux=sx+d*rr(Rr+30,Rr+50);lowX.push(ux);spot('understairs',ux,bot,o=>sitCat(ux,bot,S(o,46),o));
    const step=s=>{const a0=s.a-.36,a1=s.a+.36,e=[];for(let i=0;i<=4;i++)e.push(P(Rr,a0+(a1-a0)*i/4,s.y));
      if(!s.front)add('shade',1.2,q=>q.poly(e.concat(e.map(p=>[p[0],p[1]+14]).reverse()),true,.2));
      add('paper',1.8,q=>q.poly([P(12,a0,s.y),...e,P(12,a1,s.y)],true,.3));
      if(s.front)add('paper',1.5,q=>{q.poly(e.concat(e.map(p=>[p[0],p[1]+14]).reverse()),true,.2)});
      if(s.front&&s.cat){const[cx,cy]=P(Rr*.6,s.a,s.y);spot('stairs',cx,cy,o=>loafCat(cx,cy,S(o,36),o))}};
    const runs=[];let cur=null;
    for(const s of st){if(!cur||cur.front!==s.front){cur={front:s.front,pts:[],bal:[]};runs.push(cur)}const p=P(Rr-8,s.a,s.y);cur.pts.push([p[0],p[1]-86]);cur.bal.push(p)}
    for(let i=1;i<runs.length;i++)runs[i-1].pts.push(runs[i].pts[0]);
    const rail=f=>{for(const r of runs)if(r.front===f&&r.pts.length>1){add('none',1.3,q=>{for(const p of r.bal)q.line(p[0],p[1],p[0],p[1]-86,.2)});add('none',3,q=>q.curve(r.pts,false))}};
    for(const s of st)if(!s.front)step(s);
    rail(false);
    add('paper',1.8,q=>q.rect(sx-12,BY-80,24,bot-BY+80,.3));
    add('none',1,q=>{for(let y=BY-40;y<bot-20;y+=rise)q.line(sx-12,y,sx+12,y+4,.2);q.line(sx-4,BY-76,sx-4,bot-4,.3)});
    add('paper',1.6,q=>{q.ell(sx,BY-92,13,14,.08);q.ell(sx,bot,26,7,.05)});
    for(const s of st)if(s.front)step(s);
    rail(true);
    add('paper',2,q=>q.rect(sx-80,BY-4,160,14,.3));
    const lx=sx+d*rr(20,45);spot('landing',lx,BY-4,o=>sitCat(lx,BY-3,S(o,44),o));
  }

  /* ---------- podlaha ---------- */
  // parkety (košíková vazba) v perspektivě
  function parquet(){const n=9,rows=[],cols=[];
    for(let k=0;k<=n;k++)rows.push(FY+(D-FY)*Math.pow(k/n,1.3));
    for(let xb=-4000;xb<=7000;xb+=220)cols.push(xb);
    add('shade',0,q=>q.rect(-10,FY,W+20,24,0));
    add('none',.9,q=>{for(const y of rows)q.line(-10,y,W+10,y,.4);for(const xb of cols){const x0=xa(xb,FY);if(Math.max(x0,xb)<-10||Math.min(x0,xb)>W+10)continue;q.line(x0,FY,xb,D,.4)}});
    add('none',.6,q=>{for(let r=0;r<n;r++)for(let c=0;c<cols.length-1;c++){const y0=rows[r],y1=rows[r+1],a=xa(cols[c],y0),b=xa(cols[c+1],y0),e=xa(cols[c],y1),f=xa(cols[c+1],y1);
      if(Math.max(b,f)<-10||Math.min(a,e)>W+10)continue;
      if((r+c)%2)for(const t of[1/3,2/3]){const y=y0+(y1-y0)*t;q.line(a+(e-a)*t,y,b+(f-b)*t,y,.2)}
      else for(const t of[1/3,2/3])q.line(a+(b-a)*t,y0,e+(f-e)*t,y1,.2)}});
  }
  // koberec v perspektivě: lem se šrafou, medailon, třásně
  function carpet(cx,y0,y1,wb){const xl=cx-wb/2,xr=cx+wb/2,Q=(i,a,b)=>[[xa(xl+i,a),a],[xa(xr-i,a),a],[xa(xr-i,b),b],[xa(xl+i,b),b]];
    add('paper',2,q=>q.poly(Q(0,y0,y1),true,.4));
    add('shade',1,q=>{q.poly(Q(26,y0+10,y1-14),true,.3);q.poly(Q(56,y0+22,y1-30).reverse(),true,.3)});
    add('none',1,q=>q.poly(Q(66,y0+26,y1-36),true,.3));
    const ym=(y0+y1)/2,sc=(ym-VY)/(D-VY),mx=xa(cx,ym),rx=wb*.16*sc,ry=(y1-y0)*.2;
    add('none',1.2,q=>{q.ell(mx,ym,rx,ry,.03);q.ell(mx,ym,rx*.6,ry*.6,.03);q.poly([[mx,ym-ry*.9],[mx+rx*1.2,ym],[mx,ym+ry*.9],[mx-rx*1.2,ym]],true,.3);
      for(const sd of[-1,1])for(const t of[.25,.75]){const yy=y0+(y1-y0)*t,xx=xa(cx+sd*wb*.36,yy);q.ell(xx,yy,14*sc+6,8,.1)}});
    add('none',1,q=>{for(let t=0;t<=1;t+=.02){const xb=xl+(xr-xl)*t,a=xa(xb,y0),b=xa(xb,y1);q.line(a,y0,a,y0-8,.2);q.line(b,y1,b,y1+10,.2)}});
  }

  /* ---------- nábytek a předměty na podlaze ---------- */
  function bankerLamp(lx,ty){
    add('paper',1.6,q=>{q.ell(lx,ty-3,18,5,.1);q.rect(lx-3,ty-42,6,40,.2)});
    add('shade',1.8,q=>q.poly([[lx-32,ty-38],[lx+32,ty-38],[lx+26,ty-56],[lx-26,ty-56]],true,.3));
    add('none',1,q=>{q.line(lx+18,ty-38,lx+18,ty-20,.1);q.ell(lx+18,ty-17,2.5,3,.1)});
  }
  function openBook(ox,ty){
    add('paper',1.4,q=>q.poly([[ox-36,ty],[ox,ty-5],[ox+36,ty],[ox+32,ty-14],[ox,ty-10],[ox-32,ty-14]],true,.3));
    add('none',.8,q=>{for(let k=0;k<3;k++){q.line(ox-26,ty-10+k*3,ox-6,ty-8+k*3,.1);q.line(ox+6,ty-8+k*3,ox+26,ty-10+k*3,.1)}});
  }
  // stůl v čítárně: dlouhý se židlemi, nebo kulatý na noze; lampy, otevřené knihy, hromádky
  function readingTable(x,y){
    if(R()<.3){const r=rr(110,130),ty=y-112,ux=x+(R()<.5?-1:1)*r*.5,sx=x+rr(-.3,.3)*r,n=Math.floor(rr(3,6)),lx=sx>x?x-r*.5:x+r*.5;
      spot('undertable',ux,y,o=>sleepCat(ux,y-2,S(o,44),o));
      add('paper',2,q=>{q.rect(x-8,ty+10,16,y-ty-24,.3);q.poly([[x-8,y-16],[x-50,y-2],[x-46,y+4],[x,y-8],[x+46,y+4],[x+50,y-2],[x+8,y-16]],true,.3)});
      add('paper',2.2,q=>{q.ell(x,ty+4,r,r*.2,.02);q.rect(x-r,ty+4,2*r,8,.2)});
      spot('booktable',sx,ty,o=>pk(sx+o.dir*4,ty-n*11,S(o,42),o));
      add('paper',1.3,q=>{for(let k=0;k<n;k++)q.rect(sx-28+rr(-5,5),ty-(k+1)*11,56+rr(-8,8),11,.3)});
      bankerLamp(lx,ty);return}
    const w=rr(300,380),ty=y-118,ux=x+rr(-.25,.25)*w,sl=[x-w*.36,x-w*.12,x+w*.12,x+w*.36];
    for(let i=3;i>0;i--){const j=Math.floor(R()*(i+1));[sl[i],sl[j]]=[sl[j],sl[i]]}
    // židle stojí u míst s nízkými věcmi (otevřená kniha nebo spící kočka), ať je kočka na židli vidět
    const chx=[sl[2],sl[3]],cc=sl[2];
    const n=Math.floor(rr(3,6)),top=R()<.5;
    // židle za stolem: opěradlo nad deskou, sedák a nohy mezi nohami stolu
    add('none',2.6,q=>{for(const c of chx){q.line(c-26,ty+46,c-26,ty-66,.3);q.line(c+26,ty+46,c+26,ty-66,.3);q.line(c-24,ty+50,c-22,y-26,.2);q.line(c+24,ty+50,c+22,y-26,.2)}});
    add('paper',1.6,q=>{for(const c of chx){q.rect(c-30,ty+40,60,10,.2);q.rect(c-26,ty-60,52,12,.2);q.rect(c-26,ty-36,52,9,.2)}});
    add('paper',1.2,q=>{for(const c of chx){q.ell(c-26,ty-70,5,5,.1);q.ell(c+26,ty-70,5,5,.1)}});
    spot('tablechair',cc,ty+14,o=>sitCat(cc,ty+14,S(o,44),o));
    add('none',2.6,q=>{q.line(x-w/2+34,ty+20,x-w/2+36,y-16,.3);q.line(x+w/2-34,ty+20,x+w/2-36,y-16,.3)});
    spot('undertable',ux,y,o=>loafCat(ux,y-2,S(o,42),o));
    add('none',3.2,q=>{q.line(x-w/2+16,ty+14,x-w/2+20,y,.4);q.line(x+w/2-16,ty+14,x+w/2-20,y,.4)});
    add('paper',1.8,q=>q.rect(x-w/2+10,ty+14,w-20,20,.5));
    add('paper',2.2,q=>q.rect(x-w/2,ty,w,16,.6));
    spot('booktable',sl[0],ty,o=>pk(sl[0]+o.dir*4,ty-n*11,S(o,42),o));
    add('paper',1.3,q=>{for(let k=0;k<n;k++)q.rect(sl[0]-30+rr(-5,5),ty-(k+1)*11,60+rr(-8,8),11,.3)});
    bankerLamp(sl[1],ty);
    if(top)spot('tabletop',sl[2],ty,o=>sleepCat(sl[2],ty+1,S(o,42),o));else openBook(sl[2],ty);
    if(R()<.5)bankerLamp(sl[3],ty);else{openBook(sl[3],ty);add('paper',1.2,q=>{q.rect(sl[3]+40,ty-14,14,14,.1)});add('none',1.2,q=>q.line(sl[3]+48,ty-12,sl[3]+60,ty-40,.1))}
  }
  // křeslo ušák, klubové křeslo, nebo pohovka chesterfield; vedle stolek
  function armchair(x,y){const t=R(),d=R()<.5?-1:1;
    const w=t<.75?rr(130,160):rr(250,300),bt=t<.4?y-190:t<.75?y-150:y-140,bx=x+rr(-.2,.2)*w,sx=x+rr(-.15,.15)*w;
    spot('chair',bx,bt,o=>peekCat(bx,bt+8,S(o,44),o));
    if(t<.4){add('paper',2.4,q=>q.curve([[x-w/2+8,y-60],[x-w/2+2,y-160],[x-w*.34,bt],[x+w*.34,bt],[x+w/2-2,y-160],[x+w/2-8,y-60]],true));
      add('paper',2.2,q=>{for(const sd of[-1,1])q.curve([[x+sd*w/2,y-90],[x+sd*(w/2+14),y-150],[x+sd*(w/2+6),y-176],[x+sd*(w/2-18),y-160],[x+sd*(w/2-20),y-90]],true)})}
    else if(t<.75)add('paper',2.4,q=>q.curve([[x-w/2+6,y-60],[x-w/2-4,y-120],[x-w*.3,bt],[x+w*.3,bt],[x+w/2+4,y-120],[x+w/2-6,y-60]],true));
    else{add('paper',2.4,q=>q.rect(x-w/2+10,bt,w-20,90,.6));add('ink',0,q=>{for(let i=1;i<6;i++)for(let j=0;j<2;j++)q.ell(x-w/2+10+(w-20)*i/6+(j?(w-20)/12:0),bt+26+j*28,2.5,2.5,.1)})}
    add('none',1,q=>q.curve([[x-w*.2,bt+30],[x,bt+22],[x+w*.2,bt+30]],false));
    add('paper',2.2,q=>q.rect(x-w/2+16,y-80,w-32,32,.6));
    if(t>=.75)add('none',1,q=>q.line(x,y-78,x,y-50,.3));
    spot('seat',sx,y-80,o=>sleepCat(sx,y-78,S(o,44),o));
    if(t<.75)for(const sd of[-1,1])add('paper',2.2,q=>q.poly([[x+sd*w/2,y-8],[x+sd*(w/2+4),y-100],[x+sd*(w/2-22),y-104],[x+sd*(w/2-24),y-8]],true,.6));
    else for(const sd of[-1,1])add('paper',2.2,q=>{q.rect(x+sd*w/2-(sd>0?30:0),y-104,30,96,.5);q.ell(x+sd*(w/2-15),y-104,20,12,.05)});
    add('paper',2.2,q=>q.rect(x-w/2+10,y-48,w-20,40,.6));
    add('none',2.4,q=>{q.line(x-w/2+14,y-8,x-w/2+12,y+4,.3);q.line(x+w/2-14,y-8,x+w/2-12,y+4,.3)});
    if(R()<.6){const tx=x+d*(w/2+54);
      add('none',2.2,q=>{q.line(tx,y-62,tx,y,.2);q.line(tx-16,y,tx+16,y,.2)});
      add('paper',1.8,q=>q.ell(tx,y-64,30,8,.05));
      if(R()<.5)add('paper',1.4,q=>{q.ell(tx-8,y-70,14,4,.1);q.rect(tx-16,y-86,16,14,.2);q.curve([[tx,y-84],[tx+8,y-82],[tx,y-76]],false)});
      else add('paper',1.2,q=>{for(let k=0;k<3;k++)q.rect(tx-18+k*2,y-72-k*9,36-k*4,9,.2)})}
  }
  // výpůjční pult: panely, razítka, kartotéční krabička, zvonek, hromádka knih
  function loanDesk(x,y){const w=rr(400,460),h=150,ty=y-h,d=R()<.5?-1:1,px=x+d*w*rr(.1,.22),sx=x-d*w*.34,cx=x-d*w*.12,bx=x+d*w*.38;
    add('none',2.4,q=>{q.line(x+d*w*.3-26,ty,x+d*w*.3-28,ty-70,.3);q.line(x+d*w*.3+26,ty,x+d*w*.3+28,ty-70,.3)});
    add('paper',1.8,q=>q.rect(x+d*w*.3-32,ty-86,64,20,.3));
    spot('desk',px,ty,o=>peekCat(px,ty+8,S(o,44),o));
    add('paper',2.4,q=>q.rect(x-w/2,ty+14,w,h-14,.6));
    add('none',1.1,q=>{const n=4,pw=(w-40)/n;for(let i=0;i<n;i++){q.rect(x-w/2+20+i*pw+8,ty+34,pw-16,h-64,.3);q.rect(x-w/2+20+i*pw+18,ty+44,pw-36,h-84,.2)}});
    add('paper',2.2,q=>q.rect(x-w/2-12,ty,w+24,16,.5));
    add('paper',1.8,q=>q.rect(x-w/2-6,y-12,w+12,12,.3));
    add('paper',1.6,q=>{q.rect(sx-34,ty-8,68,8,.2);q.rect(sx-36,ty-40,72,6,.2)});
    add('none',1.6,q=>{q.line(sx-36,ty-8,sx-36,ty-40,.1);q.line(sx+36,ty-8,sx+36,ty-40,.1)});
    add('paper',1.3,q=>{for(let k=-1;k<=1;k++){q.rect(sx+k*22-4,ty-34,8,16,.1);q.ell(sx+k*22,ty-38,6,5,.1)}});
    add('paper',1.6,q=>q.rect(cx-30,ty-30,60,30,.3));
    add('none',.9,q=>{for(let k=0;k<6;k++)q.line(cx-24+k*9,ty-30,cx-26+k*9,ty-44,.1)});
    add('paper',1.4,q=>{q.curve([[cx+44,ty],[cx+44,ty-18],[cx+56,ty-24],[cx+68,ty-18],[cx+68,ty]],true);q.ell(cx+56,ty-26,3,3,.1)});
    add('paper',1.3,q=>{for(let k=0;k<5;k++)q.rect(bx-30+rr(-4,4),ty-(k+1)*11,60+rr(-6,6),11,.3)});
    add('paper',1.2,q=>q.poly([[x-d*w*.46-16,ty-54],[x-d*w*.46+16,ty-54],[x-d*w*.46+20,ty],[x-d*w*.46-20,ty]],true,.2));
    add('none',.8,q=>{q.line(x-d*w*.46-8,ty-40,x-d*w*.46+8,ty-40,.1);q.line(x-d*w*.46-10,ty-30,x-d*w*.46+10,ty-30,.1)});
  }
  // kartotéka: mřížka šuplíků, jeden vytažený (kočka v něm), nahoře kočka nebo květina
  function catalog(x,y){const cols=Math.floor(rr(3,5)),rows=Math.floor(rr(5,8)),dw=44,dh=30,w=cols*dw+20,h=rows*dh+20,top=y-40-h,
      pc=Math.floor(R()*cols),pr=1+Math.floor(R()*(rows-2)),dx=x-w/2+10+pc*dw,dy=top+10+pr*dh,tx=x+rr(-.2,.2)*w,pl=R()<.4;
    add('none',2.6,q=>{q.line(x-w/2+10,y-40,x-w/2+6,y,.2);q.line(x+w/2-10,y-40,x+w/2-6,y,.2)});
    add('paper',2.2,q=>q.rect(x-w/2,top,w,h,.4));
    add('paper',1.8,q=>q.rect(x-w/2-8,top-12,w+16,12,.3));
    add('none',1,q=>{for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const ax=x-w/2+10+i*dw,ay=top+10+j*dh;q.rect(ax+2,ay+2,dw-4,dh-4,.2);q.rect(ax+dw/2-8,ay+6,16,7,.1)}});
    add('ink',0,q=>{for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)if(i!==pc||j!==pr)q.ell(x-w/2+10+i*dw+dw/2,top+10+j*dh+dh-9,2.5,2.5,.1)});
    add('shade',1,q=>q.rect(dx+2,dy+2,dw-4,dh-4,.2));
    spot('catalog',dx+dw/2,dy+4,o=>peekCat(dx+dw/2,dy+6,S(o,36),o));
    add('paper',1.6,q=>{q.poly([[dx-2,dy+12],[dx+2,dy+2],[dx+dw-2,dy+2],[dx+dw+2,dy+12]],true,.1);q.rect(dx-4,dy+12,dw+8,dh,.2)});
    add('none',1,q=>{q.rect(dx+dw/2-8,dy+18,16,7,.1);q.ell(dx+dw/2,dy+dh+2,3,3,.1)});
    if(pl){const px=x+(tx>x?-1:1)*w*.28;add('paper',1.4,q=>{q.poly([[px-12,top-12],[px+12,top-12],[px+14,top-34],[px-14,top-34]],true,.2)});add('paper',1.1,q=>{for(let k=0;k<5;k++)q.ell(px+(k-2)*10,top-42-(k%2)*8,9,5,.1,(k-2)*.5)})}
    spot('catalogtop',tx,top-12,o=>loafCat(tx,top-11,S(o,40),o));
  }
  // vozík na knihy se dvěma nebo třemi patry; kočka leží na spodní polici
  function bookCart(x,y){const w=rr(140,170),tiers=R()<.5?2:3,h=tiers===2?116:160,lx=x+rr(-.2,.2)*w,ys=[],bk=[];
    for(let i=0;i<tiers;i++)ys.push(y-24-(h-24)*i/(tiers-1));
    for(let i=0;i<tiers;i++){const sh=i?Math.min(46,(h-24)/(tiers-1)-12):40;let bx=x-w/2+6;
      while(bx<x+w/2-16){const bw=rr(10,18);if(!i&&bx+bw>lx-48&&bx<lx+48){bx=lx+48;continue}const bh=sh*rr(.6,1);if(R()<.9)bk.push([bx,ys[i]-bh,bw,bh]);bx+=bw+1}}
    add('paper',1.2,q=>{for(const b of bk)q.rect(b[0],b[1],b[2],b[3],.3)});
    spot('cart',lx,ys[0],o=>loafCat(lx,ys[0],S(o,38),o));
    add('paper',2,q=>{for(const yy of ys)q.rect(x-w/2,yy,w,10,.4)});
    add('none',2.4,q=>{q.line(x-w/2+4,ys[tiers-1],x-w/2+4,y-12,.3);q.line(x+w/2-4,ys[tiers-1],x+w/2-4,y-12,.3);q.line(x+w/2-4,ys[tiers-1],x+w/2+26,ys[tiers-1]-40,.3)});
    for(const sd of[-1,1])add('paper',1.8,q=>q.ell(x+sd*(w/2-14),y-6,8,8,.05));
  }
  // globus: na trojnožce, na sloupku, nebo na stolku
  function globe(x,y){const t=R(),r=t<.66?rr(44,54):34,cy=t<.34?y-110:t<.66?y-120:y-120,d=R()<.5?-1:1,gx=x+d*r*.5;
    if(t<.34)add('none',2.4,q=>{q.line(x,cy+r,x,y-40,.2);q.line(x,y-40,x-40,y,.2);q.line(x,y-40,x+40,y,.2);q.line(x,y-40,x+4,y+6,.2)});
    else if(t<.66)add('paper',2,q=>{q.rect(x-8,cy+r,16,y-cy-r-14,.2);q.ell(x,y-8,34,9,.05)});
    else{add('none',2.4,q=>{q.line(x-40,y-70,x-44,y,.2);q.line(x+40,y-70,x+44,y,.2)});add('paper',2,q=>q.rect(x-52,y-78,104,12,.3));add('paper',1.6,q=>{q.rect(x-4,cy+r,8,y-78-cy-r,.1);q.ell(x,y-80,16,4,.1)})}
    spot('globe',gx,cy-r,o=>peekCat(gx,cy-r*.8,S(o,40),o));
    add('paper',2,q=>q.ell(x,cy,r,r,.03));
    add('none',1,q=>{q.ell(x,cy,r*.42,r,.05);q.line(x-r,cy,x+r,cy,.3);q.curve([[x-r*.7,cy-r*.5],[x-r*.2,cy-r*.7],[x+r*.1,cy-r*.3],[x+r*.5,cy-r*.45]],false);q.curve([[x-r*.4,cy+r*.2],[x,cy+r*.35],[x+r*.3,cy+r*.6]],false)});
    add('none',2,q=>q.curve([[x-r-10,cy+r*.5],[x-r-8,cy-r*.6],[x-r*.3,cy-r-10],[x+r*.5,cy-r-6]],false));
  }
  // stojan s mapou: pobřeží, síť, růžice a trasa
  function mapStand(x,y){const w=rr(170,200),h=rr(120,140),top=y-230,mx=x+rr(-.25,.25)*w;
    add('none',2.4,q=>{q.line(x-50,y,x-20,top+20,.3);q.line(x+50,y,x+20,top+20,.3);q.line(x,top+30,x+6,y-10,.3)});
    spot('map',mx,top,o=>pk(mx,top,S(o,42),o));
    add('paper',2.2,q=>q.rect(x-w/2,top,w,h,.4));
    add('none',.8,q=>{for(let k=1;k<4;k++){q.line(x-w/2+w*k/4,top+4,x-w/2+w*k/4,top+h-4,.2);q.line(x-w/2+4,top+h*k/4,x+w/2-4,top+h*k/4,.2)}});
    add('paper',1.3,q=>q.curve([[x-w*.42,top+h*.2],[x-w*.1,top+h*.18],[x+w*.05,top+h*.4],[x-w*.08,top+h*.7],[x-w*.3,top+h*.82],[x-w*.44,top+h*.6]],true));
    add('none',1.1,q=>{const cx=x+w*.3,cy=top+h*.7;q.line(cx-14,cy,cx+14,cy,.1);q.line(cx,cy-14,cx,cy+14,.1);q.ell(cx,cy,6,6,.1);for(let k=0;k<5;k++)q.line(x-w*.2+k*16,top+h*.4-k*4,x-w*.2+k*16+8,top+h*.38-k*4,.1)});
    add('none',2,q=>q.line(x-w/2-8,top+h+4,x+w/2+8,top+h+4,.2));
  }
  // hromádka knih: rovná, dvě vedle sebe, nebo s opřenou knihou
  function bookPile(x,y){const t=R(),n=Math.floor(rr(5,9)),bw=rr(60,80),d=R()<.5?-1:1,B=[];
    for(let k=0;k<n;k++)B.push([x-bw/2+rr(-7,7),y-(k+1)*12,bw+rr(-10,10),12]);
    if(t>.4&&t<.75)for(let k=0;k<3;k++)B.push([x-d*bw*.9-bw*.35+rr(-5,5),y-(k+1)*12,bw*.7,12]);
    spot('pile',x,y-n*12,o=>pk(x+d*bw*.25,y-n*12,S(o,42),o));
    add('paper',1.3,q=>{for(const b of B)q.rect(b[0],b[1],b[2],b[3],.3)});
    add('none',.8,q=>{for(const b of B)q.line(b[0]+4,b[1]+6,b[0]+b[2]*.4,b[1]+6,.1)});
    if(t>=.75)add('paper',1.3,q=>q.poly([[x+d*(bw/2+4),y],[x+d*(bw/2+20),y],[x+d*(bw/2+44),y-60],[x+d*(bw/2+28),y-64]],true,.2));
  }
  function palm(x,y){const pw=rr(60,80),ph=pw*1.1,top=y-ph;
    add('none',1.8,q=>{for(let i=0;i<8;i++){const a=rr(.3,2.85),l=rr(110,160);q.curve([[x,top],[x+Math.cos(a)*l*.45,top-l*.75],[x+Math.cos(a)*l,top-Math.sin(a)*l*.9]],false)}});
    add('paper',1.3,q=>{for(let i=0;i<10;i++){const a=rr(.3,2.85),l=rr(70,140);q.ell(x+Math.cos(a)*l*.7,top-Math.sin(a)*l*.8-20,22,7,.08,-a)}});
    spot('plant',x,top,o=>pk(x+o.dir*6,top-4,S(o,44),o));
    add('paper',2.2,q=>q.poly([[x-pw/2,top],[x+pw/2,top],[x+pw*.34,y],[x-pw*.34,y]],true,.4));
    add('none',1,q=>{q.line(x-pw*.44,top+ph*.3,x+pw*.44,top+ph*.3,.3);q.line(x-pw*.4,top+ph*.5,x+pw*.4,top+ph*.5,.3)});
    add('paper',2,q=>q.rect(x-pw/2-6,top-4,pw+12,14,.3));
  }
  // knihovnické schůdky se třemi stupni
  function stepStool(x,y){const d=R()<.5?-1:1,sx=x+d*30;
    add('paper',2,q=>q.poly([[x-d*50,y],[x-d*50,y-40],[x-d*10,y-40],[x-d*10,y-80],[x+d*30,y-80],[x+d*30,y-120],[x+d*54,y-120],[x+d*54,y]],true,.3));
    add('none',1,q=>{q.line(x-d*50,y-36,x-d*10,y-36,.2);q.line(x-d*10,y-76,x+d*30,y-76,.2);q.line(x+d*30,y-116,x+d*54,y-116,.2)});
    if(R()<.5)add('paper',1.2,q=>{for(let k=0;k<2;k++)q.rect(x-d*44-(d>0?0:30),y-52-k*10,30,10,.2)});
    spot('step',sx+d*12,y-120,o=>sitCat(sx+d*12,y-119,S(o,42),o));
  }
  // čalouněná lavice s prošíváním
  function ottoman(x,y){const w=rr(180,230),tx=x+rr(-.25,.25)*w;
    add('paper',2.4,q=>q.rect(x-w/2,y-60,w,44,.8));
    add('ink',0,q=>{for(let k=1;k<6;k++)q.ell(x-w/2+w*k/6,y-42,2.5,2.5,.1)});
    add('none',1,q=>{for(let k=1;k<6;k++){q.line(x-w/2+w*k/6,y-42,x-w/2+w*(k-.5)/6,y-58,.1);q.line(x-w/2+w*k/6,y-42,x-w/2+w*(k+.5)/6,y-58,.1)}});
    add('none',2.6,q=>{q.line(x-w/2+10,y-16,x-w/2+8,y,.2);q.line(x+w/2-10,y-16,x+w/2-8,y,.2)});
    spot('ottoman',tx,y-60,o=>sleepCat(tx,y-59,S(o,46),o));
  }
  function rugCat(x,y){spot('rug',x,y,o=>sleepCat(x,y,S(o,48),o))}
  function sign(x,y){
    add('none',2.2,q=>{q.line(x,y,x,y-100,.2);q.line(x-22,y,x+22,y,.2)});
    add('paper',2,q=>q.rect(x-34,y-150,68,50,.3));
    add('none',1.4,q=>{q.curve([[x-18,y-138],[x-6,y-130],[x-18,y-122],[x-4,y-112]],false);q.line(x+4,y-136,x+20,y-136,.2);q.line(x+4,y-124,x+22,y-124,.2);q.line(x+4,y-112,x+16,y-112,.2)});
  }

  /* ---------- sestavení ---------- */
  const shelfBays=[],lowX=[];   // lowX: x úkrytů nízko na stěně, před které se nestaví vysoký nábytek
  function groundWall(sx,left){
    const x0=left?sx+190:30,x1=left?W-30:sx-190;
    // obložení za schodištěm
    add('none',1,q=>{const a=left?10:x1+20,b=left?x0-20:W-10;for(let px=a;px<b-60;px+=110)q.rect(px,SB+40,96,FY-SB-80,.4)});
    const fw=rr(460,500),fx=rr(Math.max(x0+300,1100),Math.min(x1-300-fw,1900-fw/2));
    // úsek stěny mezi pilastry a..b rozdělí na pole: regál, okno, hodiny, nebo výklenek s bustou
    let last=null;
    const fill=(a,b)=>{let x=a+24;pilaster(a);
      while(b-24-x>=180){const r=b-24-x,u=R();
        let w=u<.55?rr(320,440):u<.78?rr(280,320):200,f=u<.55?bookBay:u<.78?winBay:u<.9?clockBay:bustBay;
        if(r-w<228)w=r;
        if(w>340)f=bookBay;else if(w<260&&f!==bookBay)f=u<.9?clockBay:bustBay;
        // dvě stejná úzká pole vedle sebe působí jako razítko
        if(f===last&&f!==bookBay)f=w>=260?bookBay:f===clockBay?bustBay:clockBay;
        f(x,w);last=f;x+=w+24;pilaster(x);x+=24}
      if(x<=b)pilaster(b)};
    fill(x0,fx);fireplace(fx+24,fw-48);fill(fx+fw,x1);
    // mosazná kolejnice pro žebříky
    add('none',2.4,q=>{for(const[x,w]of shelfBays)q.line(x-6,RAIL,x+w+6,RAIL,.3)});
    add('paper',1.2,q=>{for(const[x,w]of shelfBays)for(const px of[x+14,x+w-14])q.rect(px-4,RAIL-4,8,12,.1)});
    const lb=shelfBays.slice();for(let i=0;i<2&&lb.length;i++){const j=Math.floor(R()*lb.length),[x,w]=lb.splice(j,1)[0];ladder(x+rr(.25,.75)*w)}
  }

  function library(){
    const left=R()<.5,sx=left?rr(220,280):W-rr(220,280);
    ceiling();
    gallery();
    for(let x=rr(300,500);x<W-200;x+=rr(650,850))chandelier(x,rr(100,170));
    balustrade(sx);
    parquet();
    carpet(rr(1200,1800),rr(FY+170,FY+230),rr(1880,1950),rr(1100,1400));
    groundWall(sx,left);
    stairs(sx);
    // nábytek na podlaze bez nesmyslných překryvů; u schodiště volno
    const objs=[],taken=[{x:sx,y:FY+60,w:300,h:0}];
    // vysoké věci (h) musí mít větší odstup do hloubky, jinak se nesmyslně prolínají
    // h = výška věci: co stojí vpředu, musí být níž aspoň o svou výšku, jinak by zakrylo věc za sebou
    const put=(f,x,y,w,h)=>{if(y-h*1.1<FY-20&&lowX.some(l=>Math.abs(l-x)<w/2+60))return false;if(taken.some(t=>Math.abs(t.x-x)<(t.w+w)/2+20&&(y>=t.y?y-t.y<h:t.y-y<t.h)))return false;taken.push({x,y,w,h});objs.push({f,x,y});return true};
    const tryPut=(f,w,y0,y1,h)=>{for(let i=0;i<16;i++)if(put(f,rr(w/2+40,W-w/2-40),rr(y0,y1),w,h))return true;return false};
    tryPut(loanDesk,480,FY+130,FY+260,175);
    for(let i=0;i<3;i++)tryPut(readingTable,400,FY+260,H-60,160);
    for(let i=0;i<4;i++)tryPut(armchair,210,FY+170,H-30,175);
    for(const[f,w,h]of[[catalog,190,280],[bookCart,190,150],[globe,120,180],[mapStand,200,220],[stepStool,120,120],[ottoman,230,60],[palm,110,200],[palm,110,200],[sign,80,140],[bookCart,190,150],[ottoman,230,60]])tryPut(f,w,FY+90,H-30,h);
    for(let i=0;i<4;i++)tryPut(bookPile,100,FY+80,H-25,100);
    tryPut(box,120,FY+80,H-25,100);tryPut(yarn,60,FY+100,H-25,30);
    tryPut(rugCat,110,FY+260,1860,50);
    place(objs);
  }

  library();
}});
