// Město: obloha, kopce, řada domů a stromů, ulice s auty, plot a zahrada.
// Prostředí se registruje přes SCENE(); build(K) dostane sdílené nástroje z jádra (index.html).
SCENE({id:"mesto",ver:2,name:"Město",where:"v oknech, v keřích, na střechách i pod auty",
  // kolik koček smí mít jeden druh úkrytu (neuvedený druh = 1)
  caps:{window:5,roof:2,chimney:1,tree:2,street:2,trash:1,undercar:1,carroof:1,fence:2,bush:3,box:1,bench:1,pot:1,stone:1,bucket:1,flowers:2},
build(K){
  const{R,rr,add,spot,S,reg,head,sitCat,loafCat,sleepCat,peekCat,pick,sky,hill,bush,box,bench,bucket,yarn,shrooms}=K;

  function city(){
    sky();
    hill(760,45);
    add('none',1.2,q=>{for(let i=0;i<10;i++){const x=rr(0,W),y=rr(830,950);q.curve([[x,y],[x+40,y-5],[x+90,y+2]],false)}});
    const hp=hill(900,55);
    add('paper',1.5,q=>{for(let i=0;i<22;i++){const x=rr(20,W-20);const k=Math.min(hp.length-1,Math.max(0,Math.round((x+60)/110)));const y=hp[k][1]+rr(25,90);
      q.line(x,y,x,y-20,.4);q.ell(x,y-30,12,14,.1)}});

    // Nejdřív rozvrh aut a stromů v zahradě: jejich koruny sahají přes ulici, chodník i přízemní okna,
    // takže úkryty pod nimi se vynechají.
    const cars=[140,860,1600,2320].map(v=>v+rr(-60,60)).filter(()=>R()<.85).map(cx=>({cx,lane:R()<.5?GY+158:GY+262,w:rr(200,250)}));
    const gtree=[];
    for(const[a,b]of[[250,1300],[1700,2800]]){let bx=a,bd=-1;
      for(let i=0;i<14;i++){const x=rr(a,b),d=Math.min(1e9,...cars.map(c=>Math.abs(c.cx+c.w/2-x)));if(d>bd){bd=d;bx=x}if(d>340)break}
      gtree.push({x:bx,y:rr(GY+440,GY+520)})}
    const carOk=cars.filter(c=>gtree.every(t=>Math.abs(c.cx+c.w/2-t.x)>320));   // auto pod korunou by nebylo vidět
    const underTree=(x,m=260)=>gtree.some(t=>Math.abs(x-t.x)<m);

    /* houses */
    const wins=[];   // [x, y brady] koček v oknech – lampa nesmí stát hlavou před nimi
    let treeX=1e9;   // kmen stromu, který přijde hned za právě kresleným domem
    function win(wx,wy,ww,wh){
      add('paper',2,q=>q.rect(wx-5,wy-5,ww+10,wh+10));
      add('shade',1.4,q=>q.rect(wx,wy,ww,wh,.6));
      const ct=R();
      if(ct<.45){for(const sd of[-1,1]){const ex=sd<0?wx:wx+ww;add('paper',1.2,q=>q.poly([[ex,wy],[ex-sd*ww*.4,wy],[ex-sd*ww*.12,wy+wh*.45],[ex,wy+wh*.72]],true,.4))}}
      else if(ct<.65){const bh=wh*rr(.2,.5);add('paper',1.2,q=>{q.rect(wx,wy,ww,bh,.4)});add('none',.9,q=>{for(let y=wy+7;y<wy+bh;y+=7)q.line(wx+2,y,wx+ww-2,y,.2)})}
      else add('none',1,q=>{q.line(wx+8,wy+wh*.5,wx+20,wy+wh*.3,.3);q.line(wx+8,wy+wh*.66,wx+28,wy+wh*.38,.3)});
      const d=R()<.5?-1:1;
      wins.push([wx+ww/2,wy+wh]);
      if(!(wy+wh>GY-60&&underTree(wx+ww/2,240))&&wx+ww/2<treeX-215)spot('window',wx+ww/2,wy+wh,o=>peekCat(wx+ww/2+d*11,wy+wh,S(o,56),o));
      add('none',1.6,q=>{q.line(wx+ww/2,wy,wx+ww/2,wy+wh,.4);q.line(wx,wy+wh*.42,wx+ww,wy+wh*.42,.4)});
      add('paper',1.8,q=>q.rect(wx-10,wy+wh,ww+20,9));
      if(R()<.3){add('paper',1.6,q=>q.rect(wx-6,wy+wh+9,ww+12,15,.5));add('paper',1.1,q=>{for(let i=0;i<5;i++)q.ell(wx+i*ww/4,wy+wh+2,5.5,5,.1)})}
    }
    function door(cx){
      add('paper',2.2,q=>q.rect(cx-30,GY-128,60,128));
      add('none',1.1,q=>{q.rect(cx-21,GY-118,42,42,.5);q.rect(cx-21,GY-68,42,54,.5)});
      add('ink',0,q=>q.ell(cx+20,GY-62,3.5,3.5,.1));
      add('paper',1.8,q=>q.poly([[cx-42,GY-128],[cx+42,GY-128],[cx+34,GY-146],[cx-34,GY-146]]));
      add('paper',1.8,q=>q.rect(cx-38,GY-8,76,8));
    }
    function house(x,w){
      const h=rr(360,600),top=GY-h,gable=R()<.62,rh=w*rr(.3,.44),ov=16,px=x+w/2,py=top-rh;
      if(gable&&R()<.6){
        const side=R()<.5?-1:1,cx=px+side*w*rr(.16,.3),t=Math.abs(cx-px)/(w/2+ov),ry=py+rh*t,ct=ry-rr(50,75),cw=38;
        // brada kousek pod horní hranou stříšky komínu, jinak ji stříška zakryje
        spot('chimney',cx,ct,o=>peekCat(cx,ct-7,S(o,50),o));
        add('paper',2.2,q=>q.rect(cx-cw/2,ct,cw,ry-ct+30));
        add('none',1,q=>{q.rect(cx-cw/2+5,ct+14,14,8,.3);q.rect(cx,ct+30,14,8,.3)});
        add('paper',2.2,q=>q.rect(cx-cw/2-6,ct-12,cw+12,14));
      }
      add('paper',2.4,q=>q.rect(x,top,w,h));
      const sid=R();
      if(sid<.4)add('none',1,q=>{for(let yy=top+16;yy<GY-4;yy+=16){let xx=x+4;while(xx<x+w-12){const l=rr(40,170);q.line(xx,yy,Math.min(x+w-4,xx+l),yy,.6);xx+=l+rr(10,60)}}});
      else if(sid<.75)add('none',1.1,q=>{const n=Math.round(w*h/9000);for(let i=0;i<n;i++){const bx=rr(x+8,x+w-60),by=rr(top+10,GY-30);
        q.rect(bx,by,24,11,.4);q.rect(bx+26,by,24,11,.4);q.rect(bx+13,by+12,24,11,.4)}});
      if(gable){
        add('paper',2.4,q=>q.poly([[x-ov,top+3],[px,py],[x+w+ov,top+3]]));
        add('none',1.1,q=>{for(let yy=py+24;yy<top-4;yy+=20){const hw=(yy-py)/rh*(w/2+ov)-10,pts=[];
          for(let xx=px-hw;xx<=px+hw;xx+=15)pts.push([xx,yy+(pts.length%2?5:0)]);if(pts.length>2)q.curve(pts,false)}});
        spot('roof',px,py,o=>sitCat(px,py+4,S(o,58),o));
      }else{
        add('paper',2.2,q=>q.rect(x-6,top-22,w+12,24));
        if(R()<.5){const ax=x+w*rr(.15,.85);add('none',1.8,q=>{q.line(ax,top-22,ax,top-90,.5);q.line(ax-22,top-80,ax+22,top-80,.4);q.line(ax-15,top-66,ax+15,top-66,.4)})}
        const rx=x+w*rr(.2,.8);
        spot('roof',rx,top-22,o=>o.alt?sitCat(rx,top-20,S(o,56),o):loafCat(rx,top-20,S(o,56),o));
      }
      const cols=Math.max(1,Math.floor((w-30)/92)),cw=w/cols,floors=Math.max(0,Math.floor((h-160)/120)),dc=Math.floor(R()*cols);
      for(let f=0;f<=floors;f++){const g=f===floors,wy=g?GY-122:top+36+f*120;
        for(let c=0;c<cols;c++){const cx=x+cw*(c+.5);if(g&&c===dc){door(cx);continue}win(cx-28,wy,56,72)}}
    }
    // strom za domem se kreslí později a korunou (±190) zakryje pravá okna domu – ta nedostanou úkryt
    let hx=20,nt=R()<.28;
    while(hx<W-160){
      // další dům (se střechou přesahující o 16) začne nejdřív 65 vpravo od kmene a pravou půlku koruny zakryje
      if(nt){tree(hx+85,GY,rr(.9,1.1),hx+85+48);hx+=rr(150,200);nt=R()<.28}
      else{const w=Math.min(rr(250,420),W-20-hx);if(w<200)break;const gap=rr(8,40);nt=R()<.28;
        treeX=nt?hx+w+gap+85:1e9;house(hx,w);hx+=w+gap}
    }

    /* street */
    // Úkryty na ulici jen tam, kde je nic nakresleného později (koruna, popelnice, lampa, auto) nezakryje.
    const lamps=[];
    for(let x=rr(150,300);x<W-60;x+=rr(450,650))
      for(const dx of[0,35,-35,70,-70,105,-105,140,-140]){const lx=x+dx;
        if(!wins.some(w=>Math.abs(w[0]-lx)<60&&w[1]>GY-272&&w[1]<GY-180)){lamps.push(lx);break}}
    const cans=[];
    for(let i=0;i<3;i++)for(let k=0;k<10;k++){const x=rr(120,W-120);
      if(underTree(x)||lamps.some(l=>Math.abs(l-x)<60)||cans.some(c=>Math.abs(c-x)<160))continue;cans.push(x);break}
    add('shade',0,q=>q.rect(-10,GY+70,W+20,200,0));
    add('none',2.2,q=>{q.line(-10,GY,W+10,GY,1.2);q.line(-10,GY+70,W+10,GY+70,1.5);q.line(-10,GY+270,W+10,GY+270,1.5)});
    add('none',1,q=>{for(let x=rr(20,80);x<W;x+=rr(80,120))q.line(x,GY+3,x-8,GY+67,.5)});
    add('paper',0,q=>{for(let x=10;x<W;x+=130)q.rect(x,GY+166,64,8,.5)});
    add('none',1,q=>{for(let i=0;i<8;i++){const x=rr(0,W),y=rr(GY+90,GY+250);q.curve([[x,y],[x+12,y+5],[x+20,y-2],[x+34,y+4]],false)}});
    // kočka na chodníku: ne za popelnicí, lampou ani za autem v bližším pruhu
    const sw=[];
    for(let i=0;i<7;i++)for(let k=0;k<8;k++){const x=rr(100,W-100);
      if(underTree(x)||cans.some(c=>x>c-55&&x<c+80)||lamps.some(l=>Math.abs(l-x)<32)||sw.some(s=>Math.abs(s-x)<90)
        ||carOk.some(c=>c.lane<GY+200&&x>c.cx-28&&x<c.cx+c.w+28))continue;
      sw.push(x);spot('street',x,GY+60,o=>sitCat(x,GY+60,S(o,52),o));break}
    for(const x of cans){
      spot('trash',x,GY-2,o=>peekCat(x+o.dir*6,GY,S(o,46),o));
      add('paper',2.2,q=>q.poly([[x-26,GY],[x+26,GY],[x+21,GY+58],[x-21,GY+58]]));
      add('none',1.2,q=>{for(const k of[-12,0,12])q.line(x+k,GY+8,x+k*.85,GY+52,.3)});
      add('paper',2,q=>q.ell(x+44,GY+34,9,28,.05,.25));
    }
    for(const x of lamps){
      add('paper',2,q=>q.rect(x-5,GY-230,10,285));
      add('paper',2,q=>q.poly([[x-24,GY-228],[x+24,GY-228],[x+13,GY-262],[x-13,GY-262]]));
      add('paper',1.8,q=>q.rect(x-12,GY+45,24,12));
    }
    for(const{cx,lane,w}of carOk){
      const b=lane-26;
      // pod autem je mezera jen 26 – kočka tam spí mezi koly, hlava zůstane vidět
      spot('undercar',cx+w*.5,lane,o=>sleepCat(cx+w*.5,lane,S(o,42),o));
      add('paper',2.4,q=>q.poly([[cx,b],[cx+w,b],[cx+w+4,b-40],[cx+w*.8,b-52],[cx+w*.68,b-98],[cx+w*.3,b-98],[cx+w*.18,b-52],[cx-4,b-44]]));
      add('shade',1.6,q=>{q.poly([[cx+w*.22,b-54],[cx+w*.32,b-89],[cx+w*.48,b-89],[cx+w*.48,b-54]],true,.5);q.poly([[cx+w*.52,b-54],[cx+w*.52,b-89],[cx+w*.66,b-89],[cx+w*.76,b-54]],true,.5)});
      add('none',1.3,q=>{q.line(cx+w*.5,b-50,cx+w*.5,b-4,.4);q.line(cx+w*.56,b-38,cx+w*.62,b-38,.2);q.line(cx+w*.36,b-38,cx+w*.42,b-38,.2)});
      add('paper',1.4,q=>{q.ell(cx+w-4,b-30,7,5,.1);q.rect(cx-6,b-18,26,10,.4)});
      for(const t of[.22,.78]){add('ink',2,q=>q.ell(cx+w*t,lane-22,23,23,.03));add('paper',1,q=>q.ell(cx+w*t,lane-22,9,9,.05))}
      spot('carroof',cx+w*.49,b-98,o=>loafCat(cx+w*.49,b-96,S(o,48),o));
    }

    /* garden */
    add('none',1,q=>{for(let i=0;i<720;i++){const x=R()*W,y=rr(GY+290,H-6),h=rr(5,12);
      q.line(x,y,x-3,y-h,.3);q.line(x,y,x+1,y-h*1.2,.3);q.line(x,y,x+4,y-h,.3)}});
    add('paper',1.2,q=>{for(let i=0;i<40;i++)q.ell(rr(0,W),rr(GY+300,H-10),rr(5,11),rr(3,6),.15)});
    {let x=rr(-40,100);const base=GY+382;
      while(x<W-80){const len=rr(280,620),x1=Math.min(W+10,x+len);
        if(R()<.7){const top=base-95;let sx=rr(x+30,x1-30);
          for(let k=0;k<6&&underTree(sx,250);k++)sx=rr(x+30,x1-30);   // koruna stromu ze zahrady by hlavu zakryla
          if(!underTree(sx,250))spot('fence',sx,top+14,o=>peekCat(sx,top+16,S(o,54),o));
          add('paper',1.8,q=>{q.rect(x,base-78,x1-x,12,.6);q.rect(x,base-36,x1-x,12,.6)});
          add('paper',1.8,q=>{for(let p=x;p<x1-20;p+=34)q.poly([[p,base],[p,top+12],[p+11,top],[p+22,top+12],[p+22,base]],true,.5)});
        }
        x=x1+rr(60,260)}
    }

    // Zahrada: předměty se kreslí odzadu (podle y). Předmět vpředu nesmí zasahovat do místa, kde u předmětu
    // za ním sedí kočka (zóna z), a dva předměty se nesmí překrýt víc než z části.
    // Rozměry: b = obrys vůči bodu (x,y) [x0,y0,x1,y1], z = zóna kočky; hodnoty s rezervou na náhodnou velikost.
    const DIM={
      tree:{b:[[-35,-420,35,0],[-225,-530,225,-190]]},
      bush:{b:[[-120,-128,120,0]],z:[-72,-160,72,-88]},
      flowers:{b:[[-86,-100,86,12]],z:[-30,-84,30,-4]},
      box:{b:[[-78,-104,78,0]],z:[-32,-122,32,-70]},
      bench:{b:[[-112,-102,112,0]],z:[-86,-92,86,-44]},
      pot:{b:[[-62,-118,62,0]],z:[-24,-100,24,-52]},
      stone:{b:[[-64,-76,64,0]],z:[-36,-120,36,-40]},
      bucket:{b:[[-32,-102,32,0]],z:[-24,-100,24,-54]},
      yarn:{b:[[-20,-36,92,0]]},
      shrooms:{b:[[-46,-52,46,0]]}};
    const mv=(r,x,y)=>[r[0]+x,r[1]+y,r[2]+x,r[3]+y];
    const cut=(a,b)=>Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
    const ar=a=>(a[2]-a[0])*(a[3]-a[1]);
    const objs=[];
    const put=(t,x,y)=>{const d=DIM[t],n={t,x,y,b:d.b.map(r=>mv(r,x,y)),z:d.z&&mv(d.z,x,y)};
      for(const e of objs){const[f,k]=y>e.y?[n,e]:[e,n];   // f je vpředu (kreslí se později)
        if(k.z&&f.b.some(r=>cut(r,k.z)>0))return false;
        if(cut(f.b[0],k.b[0])>.3*Math.min(ar(f.b[0]),ar(k.b[0])))return false}
      objs.push(n);return true};
    for(const t of gtree)put('tree',t.x,t.y);
    for(let i=0;i<48;i++){const u=R(),t=u<.27?'bush':u<.45?'flowers':u<.53?'box':u<.61?'bench':u<.71?'pot':u<.8?'stone':u<.86?'bucket':u<.93?'yarn':'shrooms';
      for(let k=0;k<14;k++)if(put(t,rr(60,W-60),rr(GY+430,H-25)))break}
    const F={tree:(x,y)=>tree(x,y,1.25),bush,flowers,box,bench,pot,stone,bucket,yarn,shrooms};
    objs.sort((a,b)=>a.y-b.y);
    for(const o of objs)F[o.t](o.x,o.y);
  }

  // Strom jako v jádře, ale kočka vykukuje zpoza okraje koruny (ne uprostřed listí).
  // xm: pravá hranice, za kterou korunu zakryje dům nakreslený později.
  function tree(cx,base,sc,xm=W){
    const th=rr(190,260)*sc,fy=base-th-rr(40,80)*sc;
    add('paper',2.2,q=>q.poly([[cx-15*sc,base],[cx-9*sc,base-th],[cx+9*sc,base-th],[cx+15*sc,base]]));
    add('none',1,q=>{for(let i=0;i<4;i++){const y=base-rr(20,th-20);q.line(cx+rr(-6,6)*sc,y,cx+rr(-6,6)*sc,y-rr(12,25),.4)}});
    add('none',2,q=>{q.line(cx,base-th*.62,cx-48*sc,base-th*.86,.6);q.line(cx,base-th*.7,cx+44*sc,base-th*.95,.6)});
    const bl=[];for(let i=0;i<7;i++)bl.push([cx+rr(-95,95)*sc,fy+rr(-60,50)*sc,rr(55,80)*sc]);
    bl.sort((a,b)=>a[1]-b[1]);
    // bod těsně za obrysem kuličky (horní polovina), který neleží v žádné jiné – hlava se nakreslí před korunou
    const inB=(x,y)=>bl.some(b=>((x-b[0])/b[2])**2+((y-b[1])/(b[2]*.85))**2<1);
    // (kontroluje se střed i body po stranách hlavy; hlava se pak posune o třetinu poloměru ven)
    let tx=0,ty=0,ux=0,uy=0,ok=false;
    for(let i=0;i<40&&!ok;i++){const b=pick(bl),a=rr(-2.7,-.45),c=Math.cos(a),s=Math.sin(a),x=b[0]+c*b[2],y=b[1]+s*b[2]*.85;
      const out=(d,t)=>{const px=x+c*d-s*t,py=y+s*d+c*t;return!bl.some(e=>e!==b&&((px-e[0])/e[2])**2+((py-e[1])/(e[2]*.85))**2<1)};
      if(x+c*8<xm-26&&x>60&&x<W-60&&!inB(x+c*8,y+s*8)&&out(8,15)&&out(8,-15)&&out(20,0)){tx=x;ty=y;ux=c;uy=s;ok=true}}
    if(ok)spot('tree',tx,ty,o=>{const r=S(o,50)*.4,hx=tx+ux*r*.3,hy=ty+uy*r*.3;head(hx,hy,r,o);reg(o,hx,hy-r*.3,r*1.3)});
    for(const b of bl)add('paper',2,q=>q.ell(b[0],b[1],b[2],b[2]*.85,.08));
    add('none',1,q=>{const n=Math.round(38*sc*sc);for(let i=0;i<n;i++){const a=R()*6.283,d=Math.sqrt(R())*105*sc,x=cx+Math.cos(a)*d*1.1,y=fy+Math.sin(a)*d*.8;q.curve([[x-6,y],[x,y-5],[x+6,y]],false)}});
    if(R()<.35)add('paper',1.3,q=>{for(let i=0;i<6;i++){const a=R()*6.283,d=R()*90*sc;q.ell(cx+Math.cos(a)*d,fy+Math.sin(a)*d*.7,6,6,.1)}});
  }
  // Záhon: kočka sedí za květinami; květy před hlavou jsou nízké, ať hlava kouká nad ně.
  function flowers(x,y){
    spot('flowers',x,y,o=>sitCat(x,y-6,S(o,50),o));
    const n=Math.round(rr(6,10));
    for(let i=0;i<n;i++){const fx=x+rr(-75,75),fy=y+rr(-6,12),hx2=fx+rr(-10,10),pr=rr(6,9);let sh=rr(35,85);
      if(Math.abs(hx2-x)<42)sh=rr(16,24);
      const hy=fy-sh;
      add('none',1.4,q=>q.curve([[fx,fy],[fx+(hx2-fx)*.3+rr(-5,5),fy-sh*.5],[hx2,hy]],false));
      add('paper',1.2,q=>q.ell(fx+rr(-2,2)+8,fy-sh*.35,10,4,.1,-.5));
      add('paper',1.3,q=>{for(let k=0;k<5;k++){const a=k/5*6.283;q.ell(hx2+Math.cos(a)*pr,hy+Math.sin(a)*pr,pr*.75,pr*.75,.1)}});
      add('ink',0,q=>q.ell(hx2,hy,pr*.45,pr*.45,.1));
    }
  }
  // Květináč: listy před kočkou jen do stran, hlava zůstane nad okrajem vidět.
  function pot(x,y){const pw=rr(50,75),ph=pw*.8;
    const leaf=(a0,a1,ox)=>{const a=rr(a0,a1),len=rr(40,70);add('paper',1.5,q=>q.ell(x+ox+Math.cos(a)*len*.5,y-ph-Math.sin(a)*len*.5,len*.5,8,.06,-a))};
    for(let i=0;i<4;i++)leaf(.5,2.64,0);
    spot('pot',x,y-ph,o=>peekCat(x,y-ph+2,S(o,46),o));
    leaf(.12,.42,pw*.32);leaf(2.72,3.02,-pw*.32);
    add('paper',2.2,q=>q.poly([[x-pw/2,y-ph],[x+pw/2,y-ph],[x+pw*.38,y],[x-pw*.38,y]]));
    add('paper',2,q=>q.rect(x-pw/2-5,y-ph-2,pw+10,13,.5));
  }
  // Kámen: kočka sedí za ním, ale tak vysoko, aby hlava byla nad kamenem (i u malé kočky za velkým kamenem).
  function stone(x,y){const sw=rr(70,125),sh=sw*rr(.4,.6);
    spot('stone',x,y-sh*.5,o=>{const s=S(o,54);sitCat(x+o.dir*10,Math.min(y-sh*.35,y-sh+s*.55),s,o)});
    add('paper',2.2,q=>q.ell(x,y-sh/2,sw/2,sh/2,.12));
    add('none',1,q=>{q.curve([[x-sw*.2,y-sh*.6],[x-sw*.05,y-sh*.7],[x+sw*.1,y-sh*.55]],false);q.line(x+sw*.2,y-sh*.3,x+sw*.28,y-sh*.2,.3)});
  }

  city();
}});
