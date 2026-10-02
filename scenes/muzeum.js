// Muzeum (vzor kvality): strop se světlíkem, galerie, balkon, sloupy, podlaha v perspektivě a exponáty.
// Prostředí se registruje přes SCENE(); build(K) dostane sdílené nástroje z jádra (index.html).
SCENE({id:"muzeum",ver:3,name:"Muzeum",where:"na balkoně, za sloupy, v obrazech, u soch i u kostry dinosaura",
  // kolik koček smí mít jeden druh úkrytu (neuvedený druh = 1)
  caps:{balcony:2,railing:1,upwin:2,chandelier:1,column:2,frametop:1,portrait:1,niche:2,doorway:1,pedestal:1,vase:2,bust:1,urn:1,statue:1,case:2,dino:1,skylight:1,doorsign:1,undercase:1,casetop:1,ledge:1,cartshelf:1,canvas:1,info:1,dinotop:1,dinotail:1,sarc:1,armor:1,ottoman:1,ottomantop:1,guard:1,mopcart:1,easel:1,plant:1},
build(K){
  const{R,rr,add,spot,S,reg,head,sitCat,loafCat,sleepCat,peekCat,pick,arch,place}=K;
  // rozvržení podlahy (spočítané před kreslením): {x, y, w, ow = šířka stínění, top = nejvyšší bod}
  const FL=[];
  // je hlava kočky (střed ~yHead) u x ± hw volná? Nesmí ji zakrýt nic, co stojí před ní (větší y, kreslí se později)
  const clear=(x,hw,yHead,yBase)=>FL.every(t=>!(t.y>yBase+1&&Math.abs(t.x-x)<t.ow/2+hw&&t.top<yHead));

  /* muzeum */
  // podlaha z dlaždic v perspektivě (úběžník vx,vy)
  function mFloor(FY,vx,vy){const n=12,D=H+10,rows=[],cols=[],xa=(xb,y)=>vx+(xb-vx)*(y-vy)/(D-vy);
    for(let k=0;k<=n;k++)rows.push(FY+(D-FY)*Math.pow(k/n,1.2));
    for(let xb=-3400;xb<=6400;xb+=180)cols.push(xb);
    add('shade',0,q=>{for(let r=0;r<n;r++)for(let c=0;c<cols.length-1;c++){if((r+c)%2)continue;
      const y0=rows[r],y1=rows[r+1],a=xa(cols[c],y0),b=xa(cols[c+1],y0),d=xa(cols[c],y1),e=xa(cols[c+1],y1);
      if(Math.max(b,e)<-20||Math.min(a,d)>W+20)continue;q.poly([[a,y0],[b,y0],[e,y1],[d,y1]],true,.3)}});
    add('none',.9,q=>{for(const y of rows)q.line(-10,y,W+10,y,.4);
      for(const xb of cols){const x0=xa(xb,FY);if(Math.max(x0,xb)<-10||Math.min(x0,xb)>W+10)continue;q.line(x0,FY,xb,D,.4)}});
  }
  // kazetový strop se světlíkem
  function mCeiling(){const sk=rr(800,1500),sw=rr(600,760);
    add('shade',1.8,q=>q.rect(sk,24,sw,112,.6));
    // kočka se dívá dolů světlíkem ze střechy
    for(const t of[rr(.1,.4),rr(.6,.9)]){const x=sk+sw*t;spot('skylight',x,136,o=>peekCat(x,138,S(o,40),o))}
    add('none',1,q=>{for(let x=sk+sw/6;x<sk+sw-10;x+=sw/6)q.line(x,24,x,136,.3);q.line(sk,80,sk+sw,80,.3)});
    add('none',1.2,q=>{for(let x=16;x<W;x+=150){if(x+130>sk&&x<sk+sw)continue;q.rect(x,34,124,92,.5);q.rect(x+14,48,96,64,.4)}});
    add('none',2.2,q=>{q.line(-10,146,W+10,146,1);q.line(-10,162,W+10,162,1)});
  }
  function upWin(x,w,BY){const cx=x+w/2,r=w/2,top=212,sill=BY-112,sx=cx+rr(-.3,.3)*r;
    add('paper',2.2,q=>q.poly(arch(cx,top-12,r+12,sill+4),true,.5));
    add('shade',1.6,q=>q.poly(arch(cx,top,r,sill),true,.4));
    add('none',1.1,q=>{q.line(cx-r/3,top+r*.12,cx-r/3,sill,.3);q.line(cx+r/3,top+r*.12,cx+r/3,sill,.3);for(let y=top+r;y<sill-20;y+=62)q.line(cx-r,y,cx+r,y,.3)});
    add('paper',2,q=>q.rect(x-14,sill,w+28,12,.4));
    spot('upwin',sx,sill,o=>sitCat(sx,sill+1,S(o,44),o));
  }
  function chandelier(x,len){const y=166+len,cs=[[x-84,y-4],[x-46,y+14],[x+46,y+14],[x+84,y-4]];
    add('none',1.4,q=>q.line(x,162,x,y-8,.3));
    add('none',2,q=>{for(const d of[-1,1]){q.curve([[x,y-6],[x+d*44,y+26],[x+d*84,y-4]],false);q.curve([[x,y],[x+d*24,y+34],[x+d*46,y+14]],false)}});
    add('paper',1.8,q=>q.ell(x,y+4,30,11,.05));
    spot('chandelier',x,y-6,o=>loafCat(x,y-3,S(o,36),o));
    add('paper',1.4,q=>{for(const[cx,cy]of cs)q.rect(cx-4,cy-22,8,22,.2)});
    add('none',1.2,q=>{for(const[cx,cy]of cs)q.curve([[cx,cy-24],[cx-4,cy-31],[cx,cy-40],[cx+4,cy-31]],true)});
    add('paper',1,q=>{for(let k=-2;k<=2;k++)q.ell(x+k*12,y+24-Math.abs(k)*3,3,5,.1)});
  }
  function column(cx,top,bot,sd){const w=74,sx=cx+sd*w*.7;
    if(clear(sx,26,bot-20,bot+36))spot('column',sx,bot+36,o=>sitCat(sx,bot+36,S(o,54),o));
    add('paper',2.2,q=>q.rect(cx-w/2,top+44,w,bot+14-top-44));
    add('none',1,q=>{for(let k=-2;k<=2;k++)q.line(cx+k*12,top+54,cx+k*12,bot+4,.5)});
    add('paper',2.2,q=>{q.rect(cx-w/2-8,top+30,w+16,16,.4);q.rect(cx-w/2-18,top,w+36,30,.4)});
    add('none',1.4,q=>{for(const d of[-1,1])q.curve([[cx+d*(w/2+14),top+26],[cx+d*(w/2+22),top+14],[cx+d*(w/2+10),top+8],[cx+d*(w/2+6),top+18]],false)});
    add('paper',2.2,q=>{q.rect(cx-w/2-10,bot+14,w+20,16,.4);q.rect(cx-w/2-16,bot+28,w+32,16,.4)});
  }
  // obraz: 6 námětů (krajina, moře, portrét, zátiší, abstrakce, kočka) a 3 druhy rámu
  function paintingM(cx,top,w,h){const x=cx-w/2,t=R(),fs=R(),face=t>=.38&&t<.56||t>=.86,oval=face&&fs<.35,orn=!oval&&fs<.55;
    const ft=oval?top-18:orn?top-24:top-12,fx=oval?cx:cx+rr(-.3,.3)*w;
    if(oval){add('paper',2.6,q=>q.ell(cx,top+h/2,w/2+18,h/2+18,.02));add('none',1.2,q=>q.ell(cx,top+h/2,w/2+8,h/2+8,.02));add('shade',1.4,q=>q.ell(cx,top+h/2,w/2,h/2,.02))}
    else if(orn){add('paper',2.8,q=>q.rect(x-24,top-24,w+48,h+48,.6));
      add('none',1.1,q=>{q.rect(x-16,top-16,w+32,h+32,.4);q.rect(x-7,top-7,w+14,h+14,.3)});
      add('paper',1.6,q=>{for(const[px,py]of[[x-20,top-20],[x+w+20,top-20],[x-20,top+h+20],[x+w+20,top+h+20],[cx,top-20],[cx,top+h+20]])q.ell(px,py,9,9,.1)});
      add('shade',1.4,q=>q.rect(x,top,w,h,.4))}
    else{add('paper',2.4,q=>q.rect(x-12,top-12,w+24,h+24,.6));add('none',1,q=>q.rect(x-5,top-5,w+10,h+10,.3));add('shade',1.4,q=>q.rect(x,top,w,h,.4))}
    if(t<.22){
      add('paper',1.4,q=>q.poly([[x+3,top+h*.62],[x+w*.22,top+h*.36],[x+w*.38,top+h*.5],[x+w*.6,top+h*.28],[x+w*.8,top+h*.46],[x+w-3,top+h*.4],[x+w-3,top+h*.62]],true,.6));
      add('none',1,q=>{q.line(x+3,top+h*.62,x+w-3,top+h*.62,.3);for(let i=0;i<3;i++){const yy=top+h*(.7+i*.08);q.line(x+w*(.2+i*.05),yy,x+w*(.6-i*.04),yy,.3)}});
      const tx=x+w*rr(.12,.3);add('paper',1.3,q=>{q.rect(tx-3,top+h*.6,6,h*.3,.2);q.ell(tx,top+h*.55,w*.1,h*.12,.08)});
      add('paper',1.2,q=>q.ell(x+w*.78,top+h*.18,Math.min(w,h)*.06,Math.min(w,h)*.06,.05))}
    else if(t<.38){
      add('none',1.1,q=>{for(let i=0;i<5;i++){const yy=top+h*(.55+i*.09),pts=[];for(let k=0;k<=6;k++)pts.push([x+4+(w-8)*k/6,yy+(k%2?-5:4)]);q.curve(pts,false)}});
      const bx=x+w*rr(.3,.7),by=top+h*.55;
      add('paper',1.3,q=>{q.poly([[bx-w*.14,by-6],[bx+w*.14,by-6],[bx+w*.1,by+6],[bx-w*.1,by+6]],true,.3);q.poly([[bx,by-8],[bx,by-h*.34],[bx+w*.12,by-8]],true,.3)});
      add('paper',1.2,q=>{q.ell(x+w*.25,top+h*.18,w*.1,h*.05,.08);q.ell(x+w*.34,top+h*.16,w*.08,h*.05,.08)})}
    else if(t<.56){
      add('paper',1.5,q=>q.curve([[cx-w*.36,top+h*.98],[cx-w*.32,top+h*.74],[cx,top+h*.64],[cx+w*.32,top+h*.74],[cx+w*.36,top+h*.98]],false));
      add('paper',1.5,q=>q.ell(cx,top+h*.42,w*.15,h*.17,.05));
      add('none',1.2,q=>{q.curve([[cx-w*.16,top+h*.42],[cx-w*.18,top+h*.2],[cx,top+h*.2],[cx+w*.18,top+h*.22],[cx+w*.16,top+h*.46]],false);q.curve([[cx-w*.1,top+h*.66],[cx,top+h*.74],[cx+w*.1,top+h*.66]],false)})}
    else if(t<.72){
      add('none',1.3,q=>q.line(x+3,top+h*.78,x+w-3,top+h*.78,.4));
      add('paper',1.4,q=>q.poly([[cx-w*.08,top+h*.78],[cx+w*.08,top+h*.78],[cx+w*.12,top+h*.56],[cx+w*.04,top+h*.46],[cx-w*.04,top+h*.46],[cx-w*.12,top+h*.56]],true,.4));
      add('paper',1.1,q=>{for(let i=0;i<6;i++)q.ell(cx+rr(-.2,.2)*w,top+h*rr(.16,.4),Math.min(w,h)*.05,Math.min(w,h)*.05,.12)});
      add('paper',1.2,q=>{q.ell(cx+w*.26,top+h*.73,w*.06,w*.06,.1);q.ell(cx+w*.36,top+h*.74,w*.05,w*.05,.1);q.ell(cx-w*.3,top+h*.74,w*.07,w*.05,.1)})}
    else if(t<.86){
      add('paper',1.4,q=>{q.ell(x+w*rr(.25,.45),top+h*rr(.3,.45),w*.16,w*.16,.05);q.rect(x+w*.5,top+h*.5,w*.3,h*.3,.4)});
      add('none',1.6,q=>{q.line(x+w*.1,top+h*.8,x+w*.9,top+h*.15,.5);q.line(x+w*.15,top+h*.2,x+w*.55,top+h*.9,.5)})}
    else{const pr=Math.min(w,h)*.13,px=x+w*rr(.35,.65),py=top+h*rr(.45,.62);
      // portrét kočky: kočka schovaná „na očích“
      add('none',1.1,q=>{q.curve([[x+w*.1,top+h*.08],[x+w*.22,top+h*.5],[x+w*.1,top+h*.92]],false);q.curve([[x+w*.9,top+h*.08],[x+w*.78,top+h*.5],[x+w*.9,top+h*.92]],false);q.line(x+w*.12,top+h*.8,x+w*.88,top+h*.8,.4)});
      if(clear(px,pr,py,top+h))spot('portrait',px,py,o=>{head(px,py,pr,o);reg(o,px,py-pr*.3,pr*1.3)})}
    spot('frametop',fx,ft,o=>o.alt?loafCat(fx,ft+1,S(o,40),o):sitCat(fx,ft+1,S(o,44),o));
    add('paper',1.1,q=>q.rect(cx+w/2+34,top+h-26,40,28,.3));
    add('none',.8,q=>{q.line(cx+w/2+39,top+h-18,cx+w/2+68,top+h-18,.2);q.line(cx+w/2+39,top+h-9,cx+w/2+60,top+h-9,.2)});
  }
  function statue(x,b,s){const B=b-26*s;
    add('paper',2,q=>q.rect(x-34*s,B,68*s,26*s,.4));
    add('paper',2.2,q=>q.poly([[x-30*s,B],[x+30*s,B],[x+22*s,B-150*s],[x+26*s,B-210*s],[x+14*s,B-250*s],[x-14*s,B-250*s],[x-26*s,B-210*s],[x-24*s,B-150*s]],true,.6));
    add('none',1.1,q=>{for(let k=-2;k<=2;k++)q.curve([[x+k*9*s,B-3],[x+k*11*s+4,B-80*s],[x+k*6*s,B-150*s]],false);q.curve([[x-24*s,B-160*s],[x,B-176*s],[x+24*s,B-196*s]],false)});
    add('none',Math.max(2,5*s),q=>{q.curve([[x-24*s,B-238*s],[x-40*s,B-190*s],[x-30*s,B-150*s]],false);q.curve([[x+24*s,B-238*s],[x+44*s,B-262*s],[x+34*s,B-294*s]],false)});
    add('paper',2,q=>q.ell(x,B-272*s,17*s,21*s,.05));
    add('none',1.2,q=>{q.curve([[x-17*s,B-278*s],[x-8*s,B-296*s],[x+10*s,B-296*s],[x+17*s,B-280*s]],false);q.line(x+3*s,B-274*s,x+6*s,B-264*s,.1)});
  }
  function niche(cx,top,bot){const w=rr(160,190),r=w/2,sx=cx+(R()<.5?-1:1)*r*.64,s=(bot-top-80)/320;
    add('paper',2.4,q=>q.poly(arch(cx,top-18,r+18,bot),true,.5));
    add('shade',1.8,q=>q.poly(arch(cx,top,r,bot),true,.4));
    add('none',1,q=>{for(let k=1;k<8;k++){const a=Math.PI+k/8*Math.PI;q.line(cx,top+r,cx+Math.cos(a)*r*.9,top+r+Math.sin(a)*r*.9,.2)}});
    add('paper',2,q=>q.rect(cx-r-24,bot,w+48,18,.4));
    if(clear(sx,22,bot-40,bot))spot('niche',sx,bot,o=>sitCat(sx,bot+1,S(o,46),o));
    statue(cx,bot,s);
  }
  // průchod do další síně s hloubkou
  function doorwayM(cx,bot,w){const h=rr(470,520),top=bot-h,r=w/2,fw=w*.46,fy=bot-120,ft=top+r*.7,sx=cx+(R()<.5?-1:1)*(r-18);
    add('paper',2.6,q=>q.poly(arch(cx,top-28,r+28,bot),true,.6));
    add('shade',1.8,q=>q.poly(arch(cx,top,r,bot),true,.5));
    add('paper',1.4,q=>q.rect(cx-fw/2,ft,fw,fy-ft,.4));
    add('none',1,q=>{q.line(cx-r+4,bot,cx-fw/2,fy,.3);q.line(cx+r-4,bot,cx+fw/2,fy,.3);
      for(let k=1;k<5;k++){const t=(k/5)**1.4,yy=fy+(bot-fy)*t;q.line(cx-fw/2-(r-fw/2)*t,yy,cx+fw/2+(r-fw/2)*t,yy,.3)}
      q.rect(cx-fw*.25,ft+40,fw*.5,fw*.4,.3);q.line(cx-fw/2,ft+22,cx+fw/2,ft+22,.3)});
    if(clear(sx,26,bot-50,bot))spot('doorway',sx,bot,o=>sitCat(sx,bot-2,S(o,54),o));
    add('paper',2.2,q=>{q.rect(cx-r-28,bot-h*.78,30,h*.78,.5);q.rect(cx+r-2,bot-h*.78,30,h*.78,.5)});
    add('paper',1.8,q=>q.rect(cx-60,top-72,120,30,.4));
    add('none',1,q=>{q.line(cx-44,top-61,cx+44,top-61,.3);q.line(cx-30,top-52,cx+30,top-52,.3)});
    const gx=cx+rr(-30,30);spot('doorsign',gx,top-72,o=>loafCat(gx,top-71,S(o,36),o));
  }
  function bayM(x,w,top,bot,u){const cx=x+w/2,sh=bot-top-300;
    if(u<.3)paintingM(cx,top+rr(70,110),w*rr(.56,.7),rr(340,410));
    else if(u<.52){for(const[fx,fy,fw,fh]of[[.3,0,.36,.42],[.3,.52,.36,.34],[.72,.08,.34,.7]])paintingM(x+w*fx,top+60+fy*sh,w*fw,sh*fh)}
    else if(u<.72)niche(cx,top+70,bot-230);
    else if(u<.88)doorwayM(cx,bot,rr(190,230));
    else{paintingM(cx-w*.2,top+rr(80,120),w*.36,rr(260,320));paintingM(cx+w*.22,top+rr(150,200),w*.3,rr(200,260))}
  }
  function banner(x,top,h){const w=110,t=R();
    add('none',1.6,q=>q.line(x-w/2-10,top+4,x+w/2+10,top+4,.2));
    add('paper',2,q=>q.poly([[x-w/2,top+4],[x+w/2,top+4],[x+w/2,top+h],[x,top+h-30],[x-w/2,top+h]],true,.5));
    add('none',1.4,q=>{if(t<.5){q.ell(x,top+h*.35,30,30,.05);q.line(x-30,top+h*.35,x+30,top+h*.35,.3)}else q.poly([[x-30,top+h*.5],[x,top+h*.18],[x+30,top+h*.5]],true,.4);
      for(let k=0;k<3;k++)q.line(x-34,top+h*.62+k*16,x+34-k*14,top+h*.62+k*16,.3)});
  }
  // amfora se širokým hrdlem (vh = výška), kočka může koukat z hrdla
  function vase(x,b,vh=95){const k=vh/95;
    add('paper',2.2,q=>q.poly([[x-16,b],[x+16,b],[x+32,b-46*k],[x+16,b-78*k],[x+22,b-vh],[x-22,b-vh],[x-16,b-78*k],[x-32,b-46*k]],true,.5));
    add('none',1.6,q=>{q.curve([[x-17,b-80*k],[x-34,b-84*k],[x-28,b-58*k]],false);q.curve([[x+17,b-80*k],[x+34,b-84*k],[x+28,b-58*k]],false);q.line(x-27,b-40*k,x+27,b-40*k,.3);q.line(x-23,b-30*k,x+23,b-30*k,.3);q.line(x-20,b-vh+6,x+20,b-vh+6,.2)});
  }
  function urn(x,b){
    add('paper',2,q=>q.rect(x-14,b-12,28,12,.3));
    add('paper',2.2,q=>q.ell(x,b-40,30,28,.04));
    add('paper',2,q=>{q.rect(x-18,b-72,36,8,.3);q.ell(x,b-76,8,6,.1)});
    add('none',1.1,q=>{q.curve([[x-28,b-48],[x,b-40],[x+28,b-48]],false);q.curve([[x-26,b-30],[x,b-24],[x+26,b-30]],false)});
  }
  function bust(x,b){
    add('paper',2,q=>q.rect(x-18,b-20,36,20,.3));
    add('paper',2.2,q=>q.curve([[x-44,b-20],[x-40,b-60],[x,b-72],[x+40,b-60],[x+44,b-20]],true));
    add('paper',2.2,q=>q.ell(x,b-100,24,30,.04));
    add('none',1.2,q=>{q.curve([[x+2,b-104],[x+8,b-92],[x+2,b-90]],false);q.curve([[x-22,b-112],[x-8,b-132],[x+16,b-128],[x+24,b-110]],false)});
  }
  function crown(x,b){
    add('paper',2,q=>q.curve([[x-40,b],[x-44,b-18],[x,b-26],[x+44,b-18],[x+40,b]],true));
    add('paper',2,q=>q.poly([[x-24,b-20],[x+24,b-20],[x+28,b-56],[x+14,b-38],[x,b-62],[x-14,b-38],[x-28,b-56]],true,.3));
    add('ink',0,q=>{q.ell(x,b-30,3,3,.1);q.ell(x-14,b-28,2.5,2.5,.1);q.ell(x+14,b-28,2.5,2.5,.1)});
  }
  // podstavec: 3 tvary, 6 druhů exponátu (nebo prázdný s kočkou jako exponátem)
  function pedestalM(x,y){const kind=R(),ex=R(),h=rr(100,140),d=R()<.5?-1:1;let tp;
    if(kind<.4){const w=rr(70,86);add('paper',2.2,q=>q.rect(x-w/2,y-h,w,h,.5));add('paper',2,q=>{q.rect(x-w/2-8,y-h-12,w+16,12,.4);q.rect(x-w/2-8,y-10,w+16,10,.4)});tp=y-h-12}
    else if(kind<.7){add('paper',2.2,q=>q.rect(x-28,y-h,56,h,.5));add('none',1,q=>{for(let k=-1;k<=1;k++)q.line(x+k*14,y-h+6,x+k*14,y-14,.3)});add('paper',2,q=>{q.ell(x,y-h-4,42,10,.05);q.ell(x,y-8,40,10,.05)});tp=y-h-8}
    else{add('paper',2.2,q=>q.rect(x-48,y-30,96,30,.4));add('paper',2.2,q=>q.rect(x-36,y-30-h*.7,72,h*.7,.4));add('paper',2,q=>q.rect(x-44,y-42-h*.7,88,12,.4));tp=y-42-h*.7}
    add('paper',1,q=>q.rect(x-14,y-h*.45-8,28,16,.2));
    // úkryt jen tehdy, když hlavu nezakryje exponát postavený před podstavcem
    const ok=(cx,yh)=>clear(cx,20,yh,y);
    if(ex<.2){if(ok(x,tp-50))spot('pedestal',x,tp,o=>sitCat(x,tp+1,S(o,50),o))}
    else if(ex<.4){const vh=rr(76,92);if(ok(x,tp-vh-8))spot('vase',x,tp-vh,o=>peekCat(x,tp-vh+5,S(o,40),o));vase(x,tp,vh)}
    else if(ex<.56){if(ok(x+d*30,tp-86))spot('bust',x+d*26,tp,o=>peekCat(x+d*30,tp-74,S(o,40),o));bust(x,tp)}
    else if(ex<.72){if(ok(x+d*32,tp-66))spot('urn',x+d*32,tp,o=>{const s=S(o,40);peekCat(x+d*(14+s*.44),tp-50,s,o)});urn(x,tp)}
    else if(ex<.86)statue(x,tp,.36);
    else crown(x,tp);
  }
  function vitrine(x,y){const w=rr(170,220),bh=90,gh=rr(80,100),top=y-bh-gh,ix=x+rr(-.3,.3)*w,cx=x+rr(-.25,.25)*w,ux=x+rr(-.18,.18)*w;
    add('none',2.6,q=>{q.line(x-w/2+12,y-30,x-w/2+12,y,.3);q.line(x+w/2-12,y-30,x+w/2-12,y,.3)});
    if(clear(ux,30,y-8,y))spot('undercase',ux,y,o=>sleepCat(ux,y-1,S(o,38),o));
    add('paper',2.2,q=>q.rect(x-w/2,y-bh,w,bh-30,.5));
    add('paper',1,q=>q.rect(x-18,y-bh+16,36,16,.2));
    if(R()<.5){add('paper',1.6,q=>q.ell(ix,y-bh-20,20,18,.06));add('ink',0,q=>{q.ell(ix-7,y-bh-22,4,5,.1);q.ell(ix+7,y-bh-22,4,5,.1)})}
    else add('paper',1.4,q=>{for(let k=0;k<5;k++)q.ell(ix+k*12-24,y-bh-5,7,4,.1)});
    if(clear(cx,26,y-bh-20,y))spot('case',cx,y-bh,o=>loafCat(cx,y-bh,S(o,40),o));
    add('none',1.8,q=>q.rect(x-w/2+4,top,w-8,gh,.4));
    add('none',1,q=>{q.line(x-w/2+18,top+10,x-w/2+36,top+32,.3);q.line(x-w/2+26,top+8,x-w/2+52,top+40,.3)});
  }
  function tallCase(x,y){const w=rr(100,120),h=rr(250,290),top=y-h,sh=[top+80,top+160,y-50],cx=x+rr(-.15,.15)*w,sy=sh[Math.floor(R()*3)];
    add('paper',2.2,q=>q.rect(x-w/2,y-50,w,50,.4));
    add('none',2,q=>q.rect(x-w/2,top,w,h-50,.4));
    add('none',1.4,q=>{for(const s of sh.slice(0,2))q.line(x-w/2+2,s,x+w/2-2,s,.3)});
    add('paper',1.3,q=>{for(const s of sh)for(let k=0;k<2;k++)q.ell(x-w*.28+k*w*.56+rr(-4,4),s-12,8,12,.1)});
    if(clear(cx,22,sy-16,y))spot('case',cx,sy,o=>loafCat(cx,sy,S(o,32),o));
    add('paper',2,q=>q.rect(x-w/2-6,top-12,w+12,14,.4));
    add('none',1,q=>{q.line(x-w/2+10,top+14,x-w/2+30,top+40,.3);q.line(x-w/2+14,top+100,x-w/2+34,top+124,.3)});
    const tx=x+rr(-.12,.12)*w;if(clear(tx,26,top-36,y))spot('casetop',tx,top-12,o=>loafCat(tx,top-11,S(o,38),o));
  }
  function dino(x,y){const s=rr(1.4,1.55),P=(a,b)=>[x+a*s,y-34+b*s],cx=x+rr(-50,50)*s;
    const bone=(pts,w)=>{add('none',w,q=>q.curve(pts,false));add('none',Math.max(1,w-4.4),q=>q.curve(pts,false),'paper')};
    const along=(pts,t)=>{const n=pts.length-1,f=t*n,i=Math.min(n-1,Math.floor(f)),u=f-i;return[pts[i][0]+(pts[i+1][0]-pts[i][0])*u,pts[i][1]+(pts[i+1][1]-pts[i][1])*u]};
    add('paper',2.4,q=>q.rect(x-440*s,y-34,880*s,34,.6));
    add('none',1,q=>q.line(x-432*s,y-22,x+432*s,y-22,.4));
    add('none',2,q=>{q.line(x-60*s,y-34,x-60*s,y-34-300*s,.3);q.line(x+90*s,y-34,x+90*s,y-34-296*s,.3)});
    if(clear(cx,26,y-80,y))spot('dino',cx,y-34,o=>sitCat(cx,y-33,S(o,56),o));
    bone([P(-150,-290),P(-100,-180),P(-150,-50),P(-110,0)],15);
    bone([P(-120,-280),P(-70,-170),P(-120,-40),P(-80,0)],15);
    bone([P(130,-300),P(160,-200),P(130,-100),P(165,0)],13);
    bone([P(150,-295),P(185,-195),P(155,-95),P(195,0)],13);
    add('none',3,q=>{for(const a of[-110,-80,165,195]){const[fx,fy]=P(a,0);q.line(fx,fy,fx+14*s,fy,.2);q.line(fx,fy,fx+10*s,fy-6*s,.2)}});
    const sp=[P(-440,-140),P(-330,-215),P(-160,-290),P(0,-315),P(130,-300),P(215,-350),P(262,-400)];
    bone(sp,16);
    add('none',2.2,q=>{for(let i=2;i<30;i++){const[a,b]=along(sp,i/30);q.line(a,b-6,a+2,b-14-6*Math.sin(i/30*Math.PI)*s,.2)}});
    for(let rx=-130;rx<=120;rx+=22){const sy=-302-12*Math.cos(rx/140),ln=150-Math.abs(rx)*.35;bone([P(rx,sy),P(rx+22,sy+ln*.5),P(rx+8,sy+ln)],8)}
    bone([P(160,-272),P(192,-232),P(208,-244)],6);
    // lebka s otevřenou tlamou
    add('paper',2.2,q=>q.curve([P(262,-384),P(300,-372),P(350,-366),P(396,-360),P(398,-350),P(340,-352),P(284,-362),P(256,-376)],true));
    add('paper',2.4,q=>q.curve([P(244,-404),P(250,-436),P(290,-452),P(340,-446),P(392,-430),P(414,-412),P(402,-398),P(340,-392),P(280,-388),P(250,-392)],true));
    add('paper',1.4,q=>{q.ell(...P(292,-424),12*s,11*s,.08);q.ell(...P(334,-418),13*s,7*s,.08)});
    add('ink',0,q=>{q.ell(...P(292,-424),5*s,5*s,.1);q.ell(...P(392,-420),3*s,2.5*s,.1)});
    add('none',1.4,q=>{for(let k=0;k<7;k++){const[tx,ty]=P(296+k*15,-392+k*.4);q.line(tx,ty,tx+2,ty+9,.1)}for(let k=0;k<6;k++){const[tx,ty]=P(300+k*15,-358);q.line(tx,ty,tx+2,ty-8,.1)}});
    const[sx,sy]=P(310,-452),[tx,ty]=along(sp,.12);
    spot('dinotop',sx,sy,o=>loafCat(sx,sy+6,S(o,40),o));
    spot('dinotail',tx,ty,o=>loafCat(tx,ty-6,S(o,38),o));
    // zábrana a štítek
    add('paper',1.4,q=>q.rect(x+300*s,y-30,70,22,.3));
    add('none',2.6,q=>{for(let k=-2;k<=2;k++){const px=x+k*190*s;q.line(px,y+48,px,y-20,.2)}});
    add('paper',1.4,q=>{for(let k=-2;k<=2;k++){const px=x+k*190*s;q.ell(px,y-24,7,7,.1);q.ell(px,y+50,14,5,.1)}});
    add('none',3,q=>{for(let k=-2;k<2;k++){const a=x+k*190*s,b=a+190*s;q.curve([[a,y-16],[(a+b)/2,y+16],[b,y-16]],false)}});
  }
  function statueBig(x,y){const ph=rr(110,140),sx=x+(R()<.5?-1:1)*78;
    if(clear(sx,24,y-45,y))spot('statue',sx,y-2,o=>sitCat(sx,y-2,S(o,50),o));
    add('paper',2.4,q=>q.rect(x-56,y-ph,112,ph,.5));
    add('paper',2.2,q=>{q.rect(x-66,y-ph-14,132,14,.4);q.rect(x-66,y-14,132,14,.4)});
    add('none',1,q=>q.rect(x-40,y-ph+22,80,ph-54,.4));
    const lx=x+(R()<.5?-1:1)*50,ly=y-ph-14;if(clear(lx,18,ly-36,y))spot('ledge',lx,ly,o=>sitCat(lx,ly+1,S(o,34),o));
    statue(x,y-ph-14,1.05);
  }
  function armor(x,y){const sx=x+(R()<.5?-1:1)*44;
    if(clear(sx,22,y-40,y))spot('armor',sx,y-2,o=>sitCat(sx,y-2,S(o,46),o));
    add('paper',2,q=>q.ell(x,y-4,44,9,.05));
    add('paper',2,q=>{q.poly([[x-22,y-8],[x-8,y-8],[x-10,y-110],[x-24,y-110]],true,.3);q.poly([[x+8,y-8],[x+22,y-8],[x+24,y-110],[x+10,y-110]],true,.3)});
    add('none',1,q=>{q.line(x-24,y-60,x-9,y-60,.2);q.line(x+9,y-60,x+24,y-60,.2)});
    add('paper',2.2,q=>q.poly([[x-30,y-108],[x+30,y-108],[x+34,y-150],[x+30,y-200],[x-30,y-200],[x-34,y-150]],true,.4));
    add('none',1.1,q=>{q.line(x,y-198,x,y-112,.2);q.curve([[x-28,y-140],[x,y-132],[x+28,y-140]],false)});
    add('paper',2,q=>{q.ell(x-38,y-192,14,12,.05);q.ell(x+38,y-192,14,12,.05)});
    add('paper',2,q=>{q.poly([[x-44,y-186],[x-34,y-186],[x-36,y-120],[x-46,y-120]],true,.3);q.poly([[x+34,y-186],[x+44,y-186],[x+46,y-120],[x+36,y-120]],true,.3)});
    add('none',2.4,q=>{q.line(x+50,y-4,x+50,y-300,.2);q.poly([[x+50,y-300],[x+62,y-284],[x+50,y-270],[x+38,y-284]],true,.1)});
    add('paper',2.2,q=>q.curve([[x-20,y-200],[x-22,y-236],[x,y-252],[x+22,y-236],[x+20,y-200]],true));
    add('none',1.4,q=>{for(let k=0;k<3;k++)q.line(x-14,y-228+k*7,x+14,y-228+k*7,.1);q.line(x,y-252,x,y-264,.1)});
    add('paper',1.2,q=>q.curve([[x,y-264],[x+14,y-280],[x+30,y-272],[x+10,y-262]],true));
  }
  function sarc(x,y){const w=rr(100,120),h=rr(260,300),sx=x+(R()<.5?-1:1)*(w/2+12);
    if(clear(sx,24,y-45,y))spot('sarc',sx,y-2,o=>sitCat(sx,y-2,S(o,50),o));
    add('paper',2.4,q=>q.curve([[x-w/2,y],[x-w/2-6,y-h*.5],[x-w*.42,y-h*.85],[x,y-h],[x+w*.42,y-h*.85],[x+w/2+6,y-h*.5],[x+w/2,y]],true));
    add('paper',1.8,q=>q.ell(x,y-h*.78,w*.26,h*.11,.05));
    add('none',1.2,q=>{q.line(x-w*.12,y-h*.8,x-w*.04,y-h*.8,.1);q.line(x+w*.04,y-h*.8,x+w*.12,y-h*.8,.1);
      for(let k=0;k<5;k++){const yy=y-h*(.58-k*.1);q.line(x-w*.38,yy,x+w*.38,yy,.4)}
      for(let k=0;k<6;k++)q.rect(x-w*.3+k*w*.1,y-h*.55+4,5,7,.1)});
  }
  function ottoman(x,y){const w=rr(200,240),bx=x+rr(-.3,.3)*w,tx=x+rr(-.3,.3)*w;
    if(clear(bx,22,y-70,y))spot('ottoman',bx,y-60,o=>peekCat(bx,y-55,S(o,46),o));
    add('paper',2.4,q=>q.rect(x-w/2,y-60,w,46,.8));
    add('ink',0,q=>{for(let k=1;k<6;k++)q.ell(x-w/2+w*k/6,y-44,2.5,2.5,.1)});
    add('none',1,q=>{for(let k=1;k<6;k++){q.line(x-w/2+w*k/6,y-44,x-w/2+w*(k-.5)/6,y-58,.1);q.line(x-w/2+w*k/6,y-44,x-w/2+w*(k+.5)/6,y-58,.1)}});
    add('none',2.6,q=>{q.line(x-w/2+10,y-14,x-w/2+8,y,.2);q.line(x+w/2-10,y-14,x+w/2-8,y,.2)});
    if(clear(tx,30,y-70,y))spot('ottomantop',tx,y-60,o=>sleepCat(tx,y-59,S(o,46),o));
  }
  // židle hlídače s odloženou čepicí
  function guard(x,y){const d=R()<.5?-1:1;
    add('none',2.6,q=>{q.line(x-22,y-56,x-24,y,.3);q.line(x+22,y-56,x+24,y,.3)});
    add('none',2.8,q=>q.line(x-d*22,y-60,x-d*26,y-150,.3));
    add('paper',2,q=>q.rect(x-d*26-10,y-150,20,60,.4));
    add('paper',2.2,q=>q.rect(x-28,y-64,56,10,.4));
    if(clear(x+d*4,22,y-100,y))spot('guard',x+d*4,y-64,o=>sitCat(x+d*4,y-63,S(o,44),o));
    add('paper',1.6,q=>{q.ell(x+d*56,y-6,20,6,.1);q.rect(x+d*56-14,y-24,28,18,.3)});
    add('none',1.4,q=>q.line(x+d*56-18,y-8,x+d*56+22,y-6,.1));
  }
  function mopCart(x,y){
    add('none',2.4,q=>{q.line(x-50,y-90,x+40,y-90,.3);q.line(x-50,y-90,x-50,y-10,.3);q.line(x+40,y-90,x+40,y-10,.3);q.line(x-50,y-40,x+40,y-40,.3)});
    if(clear(x-5,26,y-60,y))spot('cartshelf',x-5,y-40,o=>loafCat(x-5,y-39,S(o,34),o));
    add('paper',1.4,q=>{q.rect(x-44,y-120,22,30,.3);q.rect(x-14,y-108,40,18,.3)});
    for(const sd of[-1,1])add('paper',1.8,q=>q.ell(x+sd*42-5,y-6,7,7,.05));
    add('shade',1.8,q=>q.ell(x+70,y-60,26,7,.05));
    if(clear(x+70,20,y-66,y))spot('mopcart',x+70,y-60,o=>peekCat(x+70,y-54,S(o,40),o));
    add('paper',2,q=>q.poly([[x+44,y-60],[x+96,y-60],[x+90,y-8],[x+50,y-8]],true,.3));
    add('none',2.2,q=>q.line(x+62,y-56,x+104,y-230,.2));
    add('none',1.2,q=>{for(let k=-3;k<=3;k++)q.line(x+62,y-56,x+62+k*6,y-40,.2)});
  }
  // malíř kopíruje obraz: stojan, stolička a paleta
  function easel(x,y){const d=R()<.5?-1:1,sx=x+d*74;
    add('none',2.4,q=>{q.line(x-40,y,x-6,y-230,.3);q.line(x+40,y,x+6,y-230,.3);q.line(x,y-220,x+d*10,y-10,.3);q.line(x-34,y-70,x+34,y-70,.2)});
    const px=x-d*rr(18,30);if(clear(px,20,y-222,y))spot('canvas',px,y-210,o=>peekCat(px,y-204,S(o,40),o));
    add('paper',2,q=>q.rect(x-56,y-210,112,130,.4));
    add('none',1.1,q=>{q.poly([[x-50,y-120],[x-20,y-160],[x,y-140],[x+26,y-176],[x+50,y-130]],false,.5);q.ell(x+30,y-190,8,8,.1)});
    add('none',2.4,q=>{q.line(sx-16,y-56,sx-20,y,.2);q.line(sx+16,y-56,sx+20,y,.2)});
    add('paper',2,q=>q.ell(sx,y-58,24,7,.05));
    if(clear(sx,22,y-95,y))spot('easel',sx,y-60,o=>sitCat(sx,y-59,S(o,44),o));
    add('paper',1.4,q=>q.curve([[x-d*50,y-4],[x-d*80,y-12],[x-d*98,y-2],[x-d*70,y+6]],true));
    add('ink',0,q=>{for(let k=0;k<3;k++)q.ell(x-d*(64+k*10),y-3,2.5,2.5,.1)});
  }
  function bigPlant(x,y){const pw=rr(70,90),ph=pw*.9,top=y-ph;
    add('none',2,q=>{for(let i=0;i<7;i++){const a=rr(.35,2.8),l=rr(110,170);q.curve([[x,top],[x+Math.cos(a)*l*.4,top-l*.7],[x+Math.cos(a)*l,top-Math.sin(a)*l*.9]],false)}});
    add('paper',1.4,q=>{for(let i=0;i<8;i++){const a=rr(.35,2.8),l=rr(80,150);q.ell(x+Math.cos(a)*l*.7,top-Math.sin(a)*l*.8-20,24,8,.08,-a)}});
    if(clear(x,22,top-16,y))spot('plant',x,top,o=>peekCat(x+o.dir*6,top+1,S(o,44),o));
    add('paper',2.2,q=>q.poly([[x-pw/2,top],[x+pw/2,top],[x+pw*.36,y],[x-pw*.36,y]],true,.4));
    add('paper',2,q=>q.rect(x-pw/2-6,top-4,pw+12,14,.3));
  }
  function infoStand(x,y){const px=x+rr(-14,14);
    add('none',2.4,q=>{q.line(x,y,x,y-90,.2);q.line(x-24,y,x+24,y,.2)});
    if(clear(px,20,y-150,y))spot('info',px,y-140,o=>peekCat(px,y-134,S(o,40),o));
    add('paper',2,q=>q.poly([[x-40,y-90],[x+40,y-90],[x+34,y-140],[x-34,y-140]],true,.3));
    add('none',1,q=>{for(let k=0;k<4;k++)q.line(x-26,y-128+k*9,x+26-k*6,y-128+k*9,.2)});
  }

  function museum(){const FY=1400,BY=560;
    // exponáty na podlaze se rozmístí předem (bez nesmyslných překryvů, dinosaurus uprostřed),
    // aby úkryty na zdi i u exponátů věděly, co bude stát před nimi (clear)
    // plán přízemí: sloupy (strana kočky) a pole mezi nimi (u = druh: obraz, výklenek, průchod…)
    const cols=[],bays=[];
    {let x=10;while(x<W-60){cols.push({cx:x+40,sd:R()<.5?-1:1});x+=80;const bw=Math.min(rr(460,580),W-60-x);if(bw<300)break;bays.push({x,bw,u:R()});x+=bw}}
    // místa u zdi, kam se nesmí postavit vysoký exponát (hlava kočky ve výšce yh musí zůstat vidět)
    const Z=cols.map(c=>({x:c.cx+c.sd*52,hw:26,yh:FY-20}));
    for(const b of bays){const cx=b.x+b.bw/2;if(b.u>=.72&&b.u<.88)Z.push({x:cx,hw:120,yh:FY-50});else if(b.u>=.52&&b.u<.72)Z.push({x:cx,hw:80,yh:FY-270})}
    const objs=[],dx=rr(1000,2000),dy=rr(FY+300,FY+370);
    const put=(f,x,y,w,h,ow=w)=>{if(FL.some(t=>Math.abs(t.x-x)<(t.w+w)/2+20&&Math.abs(t.y-y)<70))return false;
      if(FL.length&&Z.some(z=>Math.abs(z.x-x)<z.hw+ow/2&&y-h<z.yh))return false;
      FL.push({x,y,w,ow,top:y-h});objs.push({f,x,y});return true};
    const tryPut=(f,w,h,y0,y1)=>{for(let i=0;i<12;i++){const x=rr(90,W-90),y=rr(y0,y1);if(Math.abs(x-dx)<740&&y>dy-400&&y<dy+150)continue;if(put(f,x,y,w,h))return}};
    put(dino,dx,dy,1360,730);
    tryPut(sarc,130,300,FY+80,FY+180);
    for(let i=0;i<2;i++){tryPut(statueBig,150,480,FY+90,FY+220);tryPut(armor,110,305,FY+70,FY+160)}
    for(const[f,w,h]of[[guard,130,150],[mopCart,160,130],[easel,200,232],[infoStand,130,140]])tryPut(f,w,h,FY+90,H-30);
    const KS=[[pedestalM,100,260],[pedestalM,100,260],[pedestalM,100,260],[pedestalM,100,260],[vitrine,230,192],[vitrine,230,192],[tallCase,130,305],[ottoman,240,64],[ottoman,240,64],[bigPlant,110,250,300]];
    for(let i=0;i<70&&objs.length<34;i++){const[f,w,h,ow]=pick(KS),x=rr(80,W-80),y=rr(FY+70,H-25);if(Math.abs(x-dx)<740&&y>dy-400&&y<dy+150)continue;put(f,x,y,w,h,ow)}
    mCeiling();
    // horní patro: okna a menší obrazy
    add('none',1.2,q=>q.line(-10,190,W+10,190,.6));
    {let x=rr(40,110);while(x<W-200){const w=rr(140,170);upWin(x,w,BY);x+=w;const g=rr(180,260);
      if(x+g<W-40)paintingM(x+g/2,rr(250,290),Math.min(g-70,rr(90,120)),rr(110,150));x+=g}}
    for(let x=rr(250,500);x<W-150;x+=rr(650,850))chandelier(x,rr(110,170));
    // balkon: kočky vykukují přes zábradlí (ne u pilířků) a leží na něm
    const pil=[];for(let x=rr(200,400);x<W;x+=rr(500,600))pil.push(x);
    for(let x=rr(60,120);x<W-60;x+=rr(100,140)){if(pil.some(p=>Math.abs(p-x)<52))continue;
      spot('balcony',x,BY-74,o=>peekCat(x,BY-75,S(o,46),o))}
    add('paper',1.8,q=>{for(let x=14;x<W;x+=34)q.poly([[x-7,BY],[x+7,BY],[x+5,BY-18],[x+10,BY-38],[x+4,BY-60],[x-4,BY-60],[x-10,BY-38],[x-5,BY-18]],true,.3)});
    add('paper',2.2,q=>{q.rect(-10,BY-80,W+20,18,.6);for(const x of pil)q.rect(x-20,BY-86,40,86,.4)});
    for(let i=0;i<8;i++){const x=rr(100,W-100);spot('railing',x,BY-80,o=>loafCat(x,BY-79,S(o,40),o))}
    add('paper',2.4,q=>q.rect(-10,BY,W+20,44,.8));
    add('none',1,q=>{for(let x=30;x<W;x+=60)q.ell(x,BY+22,6,6,.1);q.line(-10,BY+36,W+10,BY+36,.5)});
    // přízemí: zeď, podlaha, sloupy a výklenky/obrazy/průchody mezi nimi
    add('none',1.2,q=>{q.line(-10,BY+84,W+10,BY+84,.6);q.line(-10,FY-172,W+10,FY-172,.6)});
    add('none',1,q=>{for(let x=30;x<W;x+=150)q.rect(x,FY-156,120,130,.5)});
    mFloor(FY,1500,480);
    add('paper',2,q=>q.rect(-10,FY-16,W+20,16,.5));
    cols.forEach((c,i)=>{column(c.cx,BY+44,FY,c.sd);const b=bays[i];if(b)bayM(b.x,b.bw,BY+44,FY,b.u)});
    // bannery visí jen na sloupech, ať nezakrývají obrazy
    {const i=1+Math.floor(R()*(cols.length-2)),j=(i+2)%cols.length||1;banner(cols[i].cx,BY+44,rr(300,380));banner(cols[j].cx,BY+44,rr(300,380))}
    place(objs);
  }

  museum();
}});
