# Najdi kočku – kontext projektu

## Co to je
Webová hra ve stylu „Find the Cat“ (česky). Velká ručně kreslená ilustrace,
ve které se schovává 20 koček a koťat. Hráč přibližuje, posouvá a ťuká na ně.
Sedm úrovní (prostředí): Město, Louka u lesa, Knihovna, Muzeum, Kavárna, Pláž, Hradčany.
Hotovo jako PWA (offline, instalace na plochu), nasazené na Cloudflare.

## Struktura
```
index.html              jádro hry: HTML, CSS, kreslení, kočky, sdílené objekty, dlaždice, UI (bez buildu)
scenes/<id>.js          jedno prostředí na soubor: SCENE({id, name, where, caps, build(K)})
tools/check-scene.mjs   kontrola scén bez prohlížeče: node tools/check-scene.mjs [id] [--seeds N]
tools/gallery.html      galerie úkrytů v prohlížeči: http://localhost:8000/tools/gallery.html?scene=<id>&max=4
.claude/agents/prostredi.md  agent pro tvorbu/předělání jednoho prostředí (pracuje jen ve svém scenes/<id>.js)
.claude/agents/beta-tester.md  agent beta tester: projde hru v prohlížeči a vrátí zprávu s chybami (kód nemění)
manifest.webmanifest    PWA manifest (lang cs, standalone, theme #fbfcfd, bg #cfd7e4)
sw.js                   service worker, cache VERSION = 'najdi-kocku-vN'; ASSETS musí obsahovat všechny scenes/*.js
wrangler.jsonc          nasazení na Cloudflare + vlastní doména
.assetsignore           soubory, které se nenasazují
fonts/                  Patrick Hand woff2 (latin + latin-ext kvůli diakritice), lokálně;
                        fonts/OFL.txt = copyright + licence SIL OFL 1.1 – musí se šířit s písmem, nemazat
                        (uvedení autora a odkaz na licenci je i v úvodní kartě, .credit)
icons/                  192, 512, maskable-512, apple-touch-icon 180, favicon-32
README.md               návod k nasazení
```
Spuštění lokálně: `python3 -m http.server` (service worker nefunguje z file://).
Nasazení: `npx wrangler deploy` (Cloudflare Worker se statickými soubory, konfigurace ve `wrangler.jsonc`,
co se nenahrává je v `.assetsignore`). Běží na https://kočky.hruškovi.eu (`xn--koky-hua.xn--hrukovi-sqb.eu`).
Náhled bez nasazení: `npx wrangler versions upload` vypíše „Version Preview URL“
(`https://<verze>-najdi-kocku.hruska-martin.workers.dev`), produkce se nezmění.
Nasazení hotové verze: `npx wrangler versions deploy` nebo `npx wrangler deploy`.

Vývoj: `?level=<id>&seed=<n>` otevře konkrétní obrázek bez úvodní karty a nic neukládá.

## Architektura
- **Scéna je procedurální** ze seedu (mulberry32). Svět má 3000×2000 jednotek.
  `buildScene(lv, seed, sel)` v `index.html` připraví primitiva a sdílené objekty
  a zavolá `SCENES[lv].build(K)`. `K` obsahuje: `R`, `rr`, `add`, `spot`, `S`, `reg`, `head`,
  pózy koček, `peek`, `layout`, `pick`, `arch`, `place`, `grass`, `planks`, `stand`, `tallgrass`,
  `sky`, `hill`, `tree`, `bush`, `flowers`, `box`, `bench`, `pot`, `stone`, `bucket`, `yarn` a `shrooms`.
  - `peek(x, hrana, s, o, d=.18)`: kočka vykukuje zpoza hrany, brada je pod hranou o `d`·velikost,
    takže i kotě ukáže obličej. Nové scény ho mají používat místo `peekCat` s pevnou hloubkou.
  - `layout({gap, depth, cover})` rozmisťuje předměty na zemi bez nesmyslných překryvů.
    Metody: `put`, `tryPut`, `block`, `protect` (chráněná zóna, např. kolem kočky u zdi) a `place`.
    Scény předělané do 09/2026 mají vlastní `put`/`tryPut`, nové scény používají `layout`.
  - Sdílené `tallgrass`, `flowers`, `pot` a `stone` nechávají volnou hlavu kočky, i kotěte.
    Stávající scény je nepoužívají, mají vlastní varianty.
  - Každé prostředí je v `scenes/<id>.js`: město `city`, louka `meadow`, knihovna `library`,
    muzeum `museum`, kavárna `cafe`, pláž `beach`, hradcany `panorama`
    (panorama Pražského hradu přes Vltavu).
  - Soubor obsahuje název, text „kde hledat“, `caps` a vlastní objekty.
  - Scény se načítají `<script>` tagy před jádrem. Registr je `SCENES` a pořadí úrovní
    je v `LEVELS` v jádře.
  - Město: GY=1250 je linie domů. Vrstvy odzadu: obloha, kopce, řada domů a stromů,
    chodník, silnice s auty, plot, zahrada.
  - Interiéry mají vlastní linii podlahy `FY`: nahoře zeď s regály, okny nebo obrazy,
    dole podlaha.
  - Předměty na zemi se sbírají do pole `{f, x, y}` a `place()` je vykreslí seřazené podle y.
  - Vzor kvality je Muzeum (předělané po Městě). Má víc vrstev: strop se světlíkem,
    galerii s okny, lustry, balkon s balustrádou, sloupy, podlahu v perspektivě (`mFloor`)
    a exponáty. Objekty mají varianty (3 druhy rámů × 6 námětů obrazů, 3 tvary podstavců
    × 6 exponátů) a je tu zhruba 90 úkrytů.
  - `put()`/`tryPut()` v `museum()` zabraňují nesmyslnému překrývání objektů na podlaze
    a drží volno kolem dinosaura. Ostatní prostředí se mají předělat stejným stylem.
- **Úrovně:** `caps` ve scéně určuje, kolik koček smí mít jeden druh úkrytu (neuvedený druh = 1).
  Nové prostředí vyžaduje čtyři věci:
  - soubor `scenes/<id>.js`;
  - `<script>` v `index.html` a id v `LEVELS`;
  - položku v `ASSETS` v `sw.js`;
  - id v seznamu `ids` v `tools/gallery.html`.
  Na tvorbu a předělávku je agent `prostredi`.
- **Kreslení:** třída `Sh` staví `Path2D` s „roztřesenými“ čarami
  (`line`, `poly`, `rect`, `ell`, `curve`) a počítá bounding box.
  Každý prvek je položka display listu `{p, f, lw, st, b, c?, r?}`:
  - `f` je výplň a `st` tah, obojí jako klíč barvy (`paper`, `ink`, `shade`, `none`);
  - `b` je bbox pro culling;
  - `c` je index kočky a `r` role (`body`, `eye`, `hl`, `nose`, `ear`, `stripe`, `detail`) pro vybarvení.
- **Pořadí kreslení určuje schovávání.** Kočka se kreslí před tím, co ji zakrývá
  (keř, rám okna, komín, plot).
- **Rozmístění koček:** `spot(kind, x, y, drawFn)` registruje možná místa.
  `buildScene` se volá dvakrát:
  1. nanečisto posbírá spoty;
  2. `chooseCats` vybere 20 s limity podle druhu (okna max 5, keře 3…)
     a s minimální vzdáleností 130;
  3. druhý průchod kočky skutečně nakreslí.
  - Úkryt blíž než 40 jednotek k okraji světa kočku nedostane (`inside` v `chooseCats`).
    Kočka by byla mimo papír. Obraz se v dlaždicích ořezává na papír 0…W × 0…H.
- **Viditelnost:** `newScene` volá `liftHidden()`. Ta přes `catVisibility(i)` změří,
  jaký podíl kočky nezakrývá nic nakresleného později.
  - `catVisibility(i, true)` měří jen hlavu, tedy prvky označené `hd` v `head()`: uši, oči, obličej.
  - Prahy jsou tělo 25 % (`VIS_MIN`) a hlava 45 % (`HEAD_MIN`), obojí v `catOk`.
  - `newScene` po sestavení změří každou kočku a úkryty pod prahem vyřadí (`bad`).
    Pak zopakuje `chooseCats` a `buildScene` (až 8×, deterministicky ze seedu).
    `CATS[i].kind` je druh úkrytu.
  - Když ani to nestačí, `liftHidden` kočku nakreslí navrch (`CATS[i].lifted`).
    Vypadá to rozbitě, je to chyba scény.
  - `tools/gallery.html?scene=<id>&max=4` ukáže příklady koček před nalezením pro každý druh úkrytu.
  - `&mode=game&n=20` ukáže kočky přesně jak je rozmístí hra, s počtem koček nakreslených navrch.
  - Obojí je seřazené od nejhorších a u každé kočky ukazuje viditelnost těla a hlavy.
  Keřová kočka se staví podle horního okraje kuliček keře (`topAt`).
- **Dva generátory:** scéna používá RNG `R`, kočky mají vlastní `RC`,
  aby druhý průchod nerozhodil scénu. Uvnitř kreslení koček se nesmí volat `R`.
- **Pózy koček:** `sitCat`, `loafCat`, `sleepCat`, `peekCat` (hlava vykukující
  zpoza okraje) a společná `head()`.
  - Varianty: `kitten` (0.64×, modré oči po nalezení), `dark`, `stripes`, `dir`.
  - Černá kočka (`dark`) je vyšrafovaná (`shade`), ne plná inkoustem. Plná výplň byla nápadnější
    než obrysové kočky. Po nalezení se vybarví do černé se žlutýma očima.
  - Nejmenší velikost kočky je `MIN_S = 22` a hlídají ji samotné pózy, i když scéna velikost dál násobí.
  - Hitbox je v `CATS[i] = {x, y, r, kitten, dark}`. Tolerance ťuknutí počítá s poloměrem
    aspoň 14 jednotek.
- **Render:**
  - Kamera `{x, y, s}` s limity `minS()` až `MAXS = 3.2`.
  - Vykreslování jde přes dlaždice (viz níže), `renderList` kreslí display list s cullingem.
  - Minimální tloušťka čáry je 0.9 px.
- **Kresebný styl** (všechny úrovně):
  - `shade` se vyplňuje šrafami perem (`HATCH`, 3 směry podle `e.h`).
  - Tah má proměnlivou tloušťku a slabý druhý tah s posunem.
  - `Sh.rect` přidává přetažené rohy (`e.o`).
  - Přes obraz je zrnitost papíru (`GRAIN`).
  - Nic z toho nevolá RNG a `e.h = hash01(index)`.
- **Dlaždice** (místo jedné bitmapy):
  - Obraz se kreslí do dlaždic 512 px v úrovních `TPX = [.5, 1, 2, 4, 8]`
    px displeje na jednotku světa.
  - Zobrazuje se úroveň ≥ potřebné (`levelFor`), takže se jen zmenšuje a je ostrá.
  - Úroveň 0 (6 dlaždic) je vždy hotová.
  - Chybějící viditelné dlaždice se kreslí v rámci snímku (limit 7 ms, aspoň jedna)
    a mezitím je zastoupí hotová hrubší nebo jemnější dlaždice.
  - `prefetch()` v nečinnosti (`requestIdleCallback`) předkresluje okolí
    a úrovně o stupeň jemnější i hrubší.
  - Paměť: nejvýš `MAXT` dlaždic (40 na zařízeních s ≤ 2 GB, jinak 96), LRU,
    předkreslené dlaždice jdou pryč dřív.
  - Celou scénu zneplatní `inval()`. Nalezená kočka zneplatní jen své dlaždice
    (`catBox` + `invalBox`) a během 450 ms animace se její viditelné dlaždice překreslují.
  - Měření výkonu: nepoužívat `getImageData` na hlavním plátně ani na dlaždicích,
    Chrome pak plátno přepne na CPU a hra zpomalí.
- **Po nalezení:**
  - Kočka se během 450 ms vybarví (`PALS`: zrzavá, šedá, smetanová, hnědá, bílá).
    Paletu určuje `(i*7+seed) % 5`.
  - Nos a vnitřek uší jsou růžové.
  - Kolem kočky se objeví slabší žlutý kroužek jako zvýrazňovač.
- **Ovládání:**
  - Pointer events: tah myší nebo prstem, pinch zoom, kolečko myši.
  - Ťuknutí = pohyb pod 9 px a pod 600 ms.
  - Dvojité ťuknutí vedle kočky přiblíží.
  - Klávesy +, − a šipky.
- **Nápověda** ukáže čárkovaný kruh o poloměru 230 jednotek kolem náhodné
  nenalezené kočky (s posunem, ne přesně) a přesune na něj kameru.
- **Uložení stavu:** localStorage `najdi-kocku-v2` =
  `{cur, games: {lv: {seed, found[], hints, elapsed, done}}, best: {lv: sekundy}}`.
  - Každá úroveň má svou rozehranou hru, přepnutí úrovně nic neztratí.
  - Starý klíč `najdi-kocku-v1` (jen město) se při načtení převede do `games.mesto` a smaže.
  - `load()` stav pročistí (`cleanStore`/`cleanGame`): poškozená hra, neznámá úroveň
    nebo neplatný čas se zahodí.
  - Ukládá se i při `pagehide` a skrytí stránky.
  - Nejlepší čas se zapíše v okamžiku nalezení poslední kočky. Karta s výsledkem se ukáže
    po 1,1 s, jen když hráč mezitím nepřepnul úroveň.
- **UI úrovní:**
  - Úvodní karta má mřížku úrovní (`renderIntro`) se stavem „rozehráno X / 20“ nebo „✓ čas“.
    Ťuknutí na prostředí rovnou spustí hru (`playLevel`): rozehranou obnoví, dohranou začne znovu.
    Tlačítko „Začít“ není. „Nový obrázek: …“ se ukáže jen u rozehrané úrovně.
  - Instalace PWA je samostatný oddíl (`installBox`, jen když je co nabídnout),
    licence písma je drobná patička karty (`.credit`).
  - Tlačítko s mapou v liště kartu otevře.
  - Karty jsou modální (`role="dialog"`, `syncModal`): lišta, zoom a plátno jsou `inert`,
    fokus skočí do karty a klávesy kamery nefungují.
  - Po dohrání se uloží nejlepší čas. Tlačítko „Další: …“ spustí další úroveň rovnou,
    bez úvodní karty, a jen krátce ukáže její název. Po poslední úrovni (Hradčany)
    se pokračuje Městem.
- **Téma:** CSS tokeny `--paper`, `--ink`, `--shade`, `--desk`, `--hl`.
  Tmavý režim přes `prefers-color-scheme` nebo `data-theme`.
  Canvas čte barvy přes `readColors()`.
- **Vzhled:** kuličkové pero na papíře (inkoust #1d2b53) a žlutý zvýrazňovač (#ffd60a).
  UI má „ručně kreslené“ rámečky přes border-radius, písmo Patrick Hand.
- **PWA:**
  - SW: stránka a skripty scén nejdřív ze sítě (nová stránka nesmí dostat staré scény),
    fonty a ikony nejdřív z cache.
  - Instalace přes `beforeinstallprompt` (tlačítko v úvodní kartě),
    na iOS se zobrazí textová rada.

## Pravidla
- Při každé změně souborů zvýšit `VERSION` v `sw.js`.
- Změna `chooseCats`, `CAPS` nebo pořadí volání `R` v některém prostředí změní
  rozmístění koček pro existující seedy této úrovně, takže uložené hry by nesouhlasily.
  V tom případě se zvýší `ver` ve `scenes/<id>.js`. Hra uloží k rozehrané hře `sv`
  a hru se starou verzí neobnoví, začne nový obrázek.
- Ověření: `node tools/check-scene.mjs` pro všechny scény (✓ bez ✗).
  Pak v prohlížeči projít řadu seedů a ověřit `catVisibility` aspoň 0.2.
  U úrovní, které se neměly měnit, porovnat otisk spotů, geometrie a pozic koček s předchozí verzí.
- Veškeré texty v UI jsou česky.
- Hra je bez zvuku. Mňouknutí (generovaná i nahrávky) se zkusila a zamítla, nenavrhovat znovu.

## Nápady na pokračování
- Další prostředí (kuchyně, zahrada, zima), víc koček a větší plátno.
- Minimapa nebo seznam nalezených koček.
- Sdílení výsledku, žebříček časů.
