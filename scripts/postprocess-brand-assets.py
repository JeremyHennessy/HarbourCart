#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageColor, ImageFilter
from pathlib import Path
from io import BytesIO
import base64, json, math, os

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public'/'brand'; MASTER=ROOT/'scripts'/'brand-masters'
NAVY='#0B315E'; OCEAN='#1E88E5'; SKY='#A7D4F2'; YELLOW='#FFD166'; WHITE='#FFFFFF'; LIGHT='#F6FAFE'
for d in ['01-logos','02-app-icons','03-banners','04-ui/icons','04-ui/states','05-social','06-docs']:(OUT/d).mkdir(parents=True,exist_ok=True)

def master(name):
    s=''.join((MASTER/f'{name}.b64').read_text().split()); return Image.open(BytesIO(base64.b64decode(s))).convert('RGBA')
horizontal=master('horizontal'); mark=master('mark'); W,H=horizontal.size
wordmark=horizontal.crop((int(W*.300),int(H*.295),W,int(H*.725))); b=wordmark.getchannel('A').getbbox(); wordmark=wordmark.crop(b)
tagline=horizontal.crop((int(W*.300),int(H*.685),W,int(H*.885))); b=tagline.getchannel('A').getbbox(); tagline=tagline.crop(b)
horizontal_notag=horizontal.crop((0,0,W,int(H*.735))); b=horizontal_notag.getchannel('A').getbbox(); horizontal_notag=horizontal_notag.crop(b)

REG=next((p for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'] if os.path.exists(p)),None)
BOLD=next((p for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf'] if os.path.exists(p)),REG)
def font(n,b=False): return ImageFont.truetype(BOLD if b else REG,max(8,int(n))) if REG else ImageFont.load_default()
def fit(a,size,pad=0,bg=(0,0,0,0)):
    w,h=size;c=Image.new('RGBA',size,bg);s=min((w-2*pad)/a.width,(h-2*pad)/a.height);r=a.resize((max(1,int(a.width*s)),max(1,int(a.height*s))),Image.Resampling.LANCZOS);c.alpha_composite(r,((w-r.width)//2,(h-r.height)//2));return c
def recolor(a,col): c=Image.new('RGBA',a.size,col);c.putalpha(a.getchannel('A'));return c
def save(im,p,colors=160):
    p.parent.mkdir(parents=True,exist_ok=True)
    try:q=im.convert('RGBA').quantize(colors=colors,method=Image.Quantize.FASTOCTREE)
    except Exception:q=im
    q.save(p,optimize=True,compress_level=9)
def webp(im,p):im.save(p,'WEBP',quality=92,method=6)
def place(c,a,box):
    x,y,w,h=box;r=fit(a,(w,h));c.alpha_composite(r,(x+(w-r.width)//2,y+(h-r.height)//2))
def gradient(size,a,b):
    w,h=size;ca=ImageColor.getrgb(a);cb=ImageColor.getrgb(b);im=Image.new('RGBA',size);d=ImageDraw.Draw(im)
    for y in range(h):
        t=y/max(1,h-1);d.line((0,y,w,y),fill=tuple(int(ca[i]*(1-t)+cb[i]*t) for i in range(3))+(255,))
    return im

# Correct board-derived logo defects: remove stray mark fragment from wordmark and rebuild the clipped stacked lockup.
def stacked(reverse=False):
    c=Image.new('RGBA',(900,900),(0,0,0,0));m=recolor(mark,WHITE) if reverse else mark;wm=recolor(wordmark,WHITE) if reverse else wordmark;tg=recolor(tagline,WHITE) if reverse else tagline
    place(c,m,(165,45,570,500));place(c,wm,(90,555,720,145));place(c,tg,(185,735,530,62));return c
for name,im in {
 'harbourcart-logo-stacked-fullcolor.png':stacked(False),'harbourcart-logo-stacked-reverse.png':stacked(True),
 'harbourcart-wordmark.png':fit(wordmark,(1400,300),40),'harbourcart-wordmark-white.png':fit(recolor(wordmark,WHITE),(1400,300),40),
 'harbourcart-tagline.png':fit(tagline,(1200,160),28),'harbourcart-tagline-white.png':fit(recolor(tagline,WHITE),(1200,160),28),
 'harbourcart-header-lockup-360x96.png':fit(horizontal,(360,96),6),'harbourcart-mobile-wordmark-240x64.png':fit(horizontal_notag,(240,64),5)
}.items():save(im,OUT/'01-logos'/name,128)
webp(fit(wordmark,(1400,300),40),OUT/'01-logos/harbourcart-wordmark.webp')

# Add default/light, alternate/dark and safe maskable app-icon masters while preserving the approved mark.
def icon_light(n):
    c=gradient((n,n),'#FFFFFF','#EDF7FF');c.alpha_composite(fit(mark,(n,n),int(n*.14)));return c
def icon_dark(n):
    c=gradient((n,n),NAVY,'#0A6FC4');p=Image.new('RGBA',(n,n),(0,0,0,0));d=ImageDraw.Draw(p);r=int(n*.36);d.ellipse((n//2-r,n//2-r,n//2+r,n//2+r),fill=(255,255,255,238));p=p.filter(ImageFilter.GaussianBlur(max(1,n//180)));c.alpha_composite(p);c.alpha_composite(fit(mark,(n,n),int(n*.19)));return c
def icon_maskable(n):
    c=gradient((n,n),'#EAF6FF','#CBEAFF');c.alpha_composite(fit(mark,(n,n),int(n*.22)));return c
save(icon_light(1024),OUT/'02-app-icons/icon-light-1024x1024.png',128);save(icon_dark(1024),OUT/'02-app-icons/icon-dark-1024x1024.png',128)
for n in [192,512]:save(icon_maskable(n),OUT/'02-app-icons'/f'icon-maskable-{n}x{n}.png',128)

# Supporting Halifax skyline/wave motif. It stays secondary to the lighthouse-cart mark.
def waves(c,top,depth):
    w,h=c.size;d=ImageDraw.Draw(c)
    for i,(col,off,amp) in enumerate([(NAVY,0,.060),(OCEAN,.24,.050),(SKY,.47,.038)]):
        pts=[(0,h)]+[(x,top+int(depth*off)+int(depth*amp*math.sin((x/w)*2*math.pi+i*.9))) for x in range(0,w+1,max(3,w//500))]+[(w,h),(0,h)];d.polygon(pts,fill=col)
def skyline(c,x0,base,width,height):
    d=ImageDraw.Draw(c);spec=[(.00,.31,.075),(.08,.50,.07),(.17,.88,.075),(.26,.56,.07),(.35,.75,.075),(.45,.44,.065),(.54,.66,.075),(.64,.58,.065),(.73,.82,.075),(.83,.49,.075),(.92,.35,.06)]
    for x,h,w in spec:
        bx=int(x0+width*x);bw=max(2,int(width*w));bh=max(3,int(height*h));d.rectangle((bx,base-bh,bx+bw,base),fill=NAVY)
    for x,sh in [(0.17,.11),(0.35,.08),(0.73,.12)]:
        cx=int(x0+width*(x+.037));top=base-int(height*dict((a,b) for a,b,_ in spec).get(x,.7));d.polygon([(cx,top-int(height*sh)),(cx-int(width*.012),top),(cx+int(width*.012),top)],fill=NAVY)
def bg(size,mobile=False):
    w,h=size;c=gradient(size,'#FFFFFF','#EAF7FF');d=ImageDraw.Draw(c);r=int(h*(.14 if not mobile else .10));sx=int(w*.84);sy=int(h*.20);d.ellipse((sx-r,sy-r,sx+r,sy+r),fill=YELLOW);base=int(h*(.76 if not mobile else .74));waves(c,base,int(h*.28));skyline(c,int(w*(.37 if not mobile else .28)),base,int(w*(.27 if not mobile else .43)),int(h*.15));return c
for name,size,mob in [('hero-desktop-background-1920x600',(1920,600),False),('hero-tablet-background-1024x400',(1024,400),False),('hero-mobile-background-390x260',(390,260),True)]:
    im=bg(size,mob);save(im,OUT/'03-banners'/(name+'.png'));webp(im,OUT/'03-banners'/(name+'.webp'))
# Compact promo, login/splash art and footer motif from the mobile reference board.
p=bg((780,280),False);d=ImageDraw.Draw(p);d.text((45,48),'Explore Deals',font=font(52,True),fill=NAVY);d.multiline_text((47,112),'Local favourites.\nBigger savings together.',font=font(24),fill=NAVY,spacing=2);place(p,mark,(560,35,170,165));save(p,OUT/'03-banners/promo-banner-780x280.png');webp(p,OUT/'03-banners/promo-banner-780x280.webp')
l=bg((780,520),True);place(l,stacked(False),(210,25,360,330));save(l,OUT/'03-banners/login-header-mobile-780x520.png')
f=Image.new('RGBA',(1920,220),(0,0,0,0));waves(f,25,180);skyline(f,340,92,520,82);save(f,OUT/'03-banners/footer-waves-1920x220.png')
sp=bg((1290,2796),True);place(sp,stacked(False),(245,610,800,980));d=ImageDraw.Draw(sp);t='Groceries,\nbought together.';ff=font(82,True);bb=d.multiline_textbbox((0,0),t,font=ff,spacing=10);d.multiline_text(((1290-(bb[2]-bb[0]))//2,1590),t,font=ff,fill=NAVY,spacing=10,align='center');save(sp,OUT/'03-banners/splash-1290x2796.png',192)

# Mobile navigation/utility icons missing from the first pass.
svgs={'home':'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9 20v-6h6v6"/>','tag':'<path d="M4 4h7l9 9-7 7-9-9V4Z"/><circle cx="8.5" cy="8.5" r="1.3"/>','orders':'<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20v-1.2A4.8 4.8 0 0 1 7.3 14h1.4a4.8 4.8 0 0 1 4.8 4.8V20M13 14h2.2a4.8 4.8 0 0 1 4.8 4.8V20"/>','compass':'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>','account':'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>','heart':'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>','bell':'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>','menu':'<path d="M4 7h16M4 12h16M4 17h16"/>'}
for n,b in svgs.items():(OUT/'04-ui/icons'/f'{n}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="{NAVY}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">{b}</svg>')

def state(kind):
    c=Image.new('RGBA',(512,384),(255,255,255,0));d=ImageDraw.Draw(c)
    if kind=='empty':
        d.polygon([(176,166),(256,125),(336,166),(256,207)],fill='#D6E3F2');d.polygon([(176,166),(256,207),(256,292),(176,248)],fill='#AFC8E4');d.polygon([(336,166),(256,207),(256,292),(336,248)],fill='#C2D7EC');d.line((256,92,256,124),fill=OCEAN,width=8);d.line((226,105,239,122),fill=OCEAN,width=7);d.line((286,105,273,122),fill=OCEAN,width=7)
    else:
        place(c,mark,(156,70,200,200));[d.ellipse((211+i*34,300,227+i*34,316),fill=[NAVY,OCEAN,SKY][i]) for i in range(3)]
    return c
for k in ['empty','loading']:save(state(k),OUT/'04-ui/states'/f'{k}-state-512x384.png',128)

README='''# HarbourCart approved brand assets\n\nThese files follow the approved **lighthouse-in-cart HarbourCart identity** shown in the supplied brand-system and mobile-asset reference boards. The earlier ZIP is a deliverable checklist only; its experimental artwork is not reused.\n\n## Locked baseline\n- Lighthouse + Halifax harbour skyline + waves inside a shopping cart\n- Wordmark: **HarbourCart**\n- Tagline: **LOCAL FOOD. STRONGER TOGETHER.**\n- Harbour Navy / Ocean Blue / Sky Blue with restrained Fresh Green and Harbour Yellow accents\n- Poppins direction with Inter/system fallback\n\n## Production use\n- `01-logos`: horizontal, stacked, mark-only, wordmark and tagline variants\n- `02-app-icons`: favicon, Apple, Android/PWA, alternate dark and maskable icons\n- `03-banners`: desktop/tablet/mobile/email art plus background-only hero assets, promo, login, splash and footer-wave graphics\n- `04-ui`: tokens/components, mobile navigation SVGs and state illustrations\n- `05-social`: Open Graph and social assets\n\nUse background-only hero files when copy should remain live HTML. Do not redraw, stretch or substitute the approved mark.\n'''
(OUT/'README.md').write_text(README)
(OUT/'06-docs/IMPLEMENTATION-NOTES.md').write_text('''# Implementation notes\n\n1. Treat the lighthouse-cart mark and blue/yellow harbour palette as the approved baseline.\n2. Do not substitute earlier H/wave, grocery-bag or generic-cart experiments.\n3. Use horizontal full-colour on light surfaces and reverse artwork on dark surfaces.\n4. Use mark-only artwork for compact/mobile contexts and app icons.\n5. Prefer `*-background-*` hero assets with live HTML headings/buttons.\n6. The skyline/wave treatment is supporting scenery, not a second logo.\n7. Load Poppins in the app; font binaries are intentionally excluded.\n8. `icon-light-1024x1024.png` is the default app identity; the dark version is an alternate.\n''')
items=[]
for p in sorted(OUT.rglob('*')):
    if p.is_file() and p.name!='asset-inventory.json':items.append({'path':str(p.relative_to(OUT)),'bytes':p.stat().st_size})
(OUT/'asset-inventory.json').write_text(json.dumps({'count':len(items),'files':items},indent=2))
print('QA postprocess complete:',len(items)+1,'files')
