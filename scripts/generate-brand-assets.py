#!/usr/bin/env python3
"""Generate approved HarbourCart brand assets from the locked lighthouse-cart masters."""
from PIL import Image, ImageDraw, ImageFont, ImageColor
from pathlib import Path
from io import BytesIO
import base64, json, math, os

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'brand'
for d in ['01-logos','02-app-icons','03-banners','04-ui/css','04-ui/react','04-ui/icons','05-social','06-docs']:
    (OUT / d).mkdir(parents=True, exist_ok=True)

NAVY='#0B315E'; OCEAN='#1E88E5'; SKY='#A7D4F2'; GREEN='#2E7D32'; YELLOW='#FFD166'; WHITE='#FFFFFF'; LIGHT='#F6FAFE'; BORDER='#DDE7F0'; MUTED='#55718F'
MASTER_DIR = ROOT / 'scripts' / 'brand-masters'

def _master_b64(name):
    return (MASTER_DIR / f'{name}.b64').read_text().strip()

def decode(name):
    return Image.open(BytesIO(base64.b64decode(_master_b64(name)))).convert('RGBA')

horizontal = decode('horizontal')
horizontal_notag = decode('horizontal_notag')
mark = decode('mark')
stacked = decode('stacked')
wordmark = decode('wordmark')
skyline = decode('skyline')

FONT_REG = next((p for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'] if os.path.exists(p)), None)
FONT_BOLD = next((p for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf'] if os.path.exists(p)), FONT_REG)
def font(size, bold=False):
    p = FONT_BOLD if bold else FONT_REG
    return ImageFont.truetype(p, size) if p else ImageFont.load_default()

def fit(asset, size, padding=0, bg=(0,0,0,0)):
    W,H=size
    c=Image.new('RGBA', size, bg)
    s=min((W-2*padding)/asset.width, (H-2*padding)/asset.height)
    r=asset.resize((max(1,int(asset.width*s)), max(1,int(asset.height*s))), Image.Resampling.LANCZOS)
    c.alpha_composite(r, ((W-r.width)//2, (H-r.height)//2))
    return c

def recolor(asset, color):
    c=Image.new('RGBA', asset.size, color)
    c.putalpha(asset.getchannel('A'))
    return c

def optimize_png(im, path, colors=128):
    try:
        q=im.quantize(colors=colors, method=Image.Quantize.FASTOCTREE)
    except Exception:
        q=im
    q.save(path, optimize=True, compress_level=9)

def save_webp(im, path):
    im.save(path, 'WEBP', quality=90, method=6)

# Logos
logo_assets = {
    'harbourcart-logo-horizontal-fullcolor.png': fit(horizontal,(1800,520),70),
    'harbourcart-logo-horizontal-fullcolor-notag.png': fit(horizontal_notag,(1800,420),70),
    'harbourcart-logo-horizontal-reverse.png': fit(recolor(horizontal,WHITE),(1800,520),70),
    'harbourcart-logo-horizontal-reverse-notag.png': fit(recolor(horizontal_notag,WHITE),(1800,420),70),
    'harbourcart-logo-stacked-fullcolor.png': fit(stacked,(900,900),80),
    'harbourcart-logo-stacked-reverse.png': fit(recolor(stacked,WHITE),(900,900),80),
    'harbourcart-wordmark.png': fit(wordmark,(1400,300),40),
    'harbourcart-wordmark-white.png': fit(recolor(wordmark,WHITE),(1400,300),40),
    'harbourcart-mark-white-1024.png': fit(recolor(mark,WHITE),(1024,1024),64),
    'harbourcart-mark-navy-1024.png': fit(recolor(mark,NAVY),(1024,1024),64),
}
for name,im in logo_assets.items(): optimize_png(im, OUT/'01-logos'/name, 96)
for base in ['harbourcart-logo-horizontal-fullcolor','harbourcart-logo-horizontal-reverse']:
    save_webp(logo_assets[base+'.png'], OUT/'01-logos'/(base+'.webp'))
for sz in [32,64,128,256,512,1024]:
    im=fit(mark,(sz,sz),max(1,int(sz*.06)))
    optimize_png(im,OUT/'01-logos'/f'harbourcart-mark-fullcolor-{sz}.png',96)
    save_webp(im,OUT/'01-logos'/f'harbourcart-mark-fullcolor-{sz}.webp')

# App icons
def gradient(size,c1,c2):
    W,H=size; a=ImageColor.getrgb(c1); b=ImageColor.getrgb(c2)
    im=Image.new('RGBA',size); d=ImageDraw.Draw(im)
    for y in range(H):
        t=y/max(1,H-1); col=tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))+(255,)
        d.line((0,y,W,y), fill=col)
    return im

def app_icon(size, maskable=False):
    bg=gradient((size,size),NAVY,OCEAN) if maskable else gradient((size,size),'#FFFFFF','#EFF8FF')
    m=recolor(mark,WHITE) if maskable else mark
    bg.alpha_composite(fit(m,(size,size),int(size*(.19 if maskable else .14))))
    return bg

for sz in [16,32,48,60,72,76,96,120,128,144,152,167,180,192,256,512,1024]:
    optimize_png(app_icon(sz), OUT/'02-app-icons'/f'icon-{sz}x{sz}.png',96)
optimize_png(app_icon(180),OUT/'02-app-icons/apple-touch-icon.png',96)
optimize_png(app_icon(192),OUT/'02-app-icons/pwa-192.png',96)
optimize_png(app_icon(512),OUT/'02-app-icons/pwa-512.png',96)
optimize_png(app_icon(192,True),OUT/'02-app-icons/icon-maskable-192x192.png',96)
optimize_png(app_icon(512,True),OUT/'02-app-icons/icon-maskable-512x512.png',96)
app_icon(48).save(OUT/'02-app-icons/favicon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48)])
manifest={
  'name':'HarbourCart','short_name':'HarbourCart','start_url':'/','display':'standalone',
  'background_color':LIGHT,'theme_color':NAVY,
  'icons':[
    {'src':'/brand/02-app-icons/pwa-192.png','sizes':'192x192','type':'image/png'},
    {'src':'/brand/02-app-icons/pwa-512.png','sizes':'512x512','type':'image/png'},
    {'src':'/brand/02-app-icons/icon-maskable-192x192.png','sizes':'192x192','type':'image/png','purpose':'maskable'},
    {'src':'/brand/02-app-icons/icon-maskable-512x512.png','sizes':'512x512','type':'image/png','purpose':'maskable'}
  ]
}
(OUT/'02-app-icons/manifest-example.json').write_text(json.dumps(manifest,indent=2))

# Banners + social
def place(c,a,box):
    x,y,w,h=box; r=fit(a,(w,h)); c.alpha_composite(r,(x+(w-r.width)//2,y+(h-r.height)//2))

def waves(c,top):
    W,H=c.size; d=ImageDraw.Draw(c)
    for i,(col,amp,off) in enumerate([(NAVY,.035,0),(OCEAN,.028,.035),(SKY,.022,.07)]):
        pts=[(0,H)]
        for x in range(0,W+1,max(3,W//500)):
            y=top+int(H*off)+int(H*amp*math.sin(x/max(1,W)*2*math.pi+i*.8)); pts.append((x,y))
        pts.extend([(W,H),(0,H)]); d.polygon(pts,fill=col)

def draw_skyline(c, x0, base, width, height):
    d=ImageDraw.Draw(c)
    # Clean, simplified Halifax waterfront silhouette based on the approved board's skyline motif.
    specs=[(.00,.34,.09),(.09,.55,.08),(.18,.92,.08),(.28,.58,.075),(.37,.78,.075),(.47,.48,.07),(.56,.70,.08),(.67,.60,.07),(.76,.86,.07),(.86,.52,.08),(.95,.38,.05)]
    for x,h,w in specs:
        bx=int(x0+width*x); bw=max(2,int(width*w)); bh=max(3,int(height*h))
        d.rectangle((bx,base-bh,bx+bw,base),fill=NAVY)
    # rooftop/spire details
    spires=[(.18,.10),(.37,.08),(.76,.12)]
    for x,sh in spires:
        cx=int(x0+width*(x+.04)); top=base-int(height*(dict((a,b) for a,b,_ in specs).get(x,.7)))
        d.polygon([(cx,top-int(height*sh)),(cx-int(width*.012),top),(cx+int(width*.012),top)],fill=NAVY)
    # small harbour tower / lighthouse-like accent from the reference skyline
    tx=int(x0+width*.62); tw=max(3,int(width*.035)); th=int(height*.64)
    d.rectangle((tx,base-th,tx+tw,base),fill=NAVY)
    d.polygon([(tx-2,base-th),(tx+tw//2,base-th-int(height*.11)),(tx+tw+2,base-th)],fill=NAVY)

def button(d,xy,label,fs):
    x0,y0,x1,y1=xy; d.rounded_rectangle(xy,radius=(y1-y0)//2,fill=OCEAN)
    f=font(fs,True); bb=d.textbbox((0,0),label,font=f)
    d.text((x0+(x1-x0-(bb[2]-bb[0]))//2,y0+(y1-y0-(bb[3]-bb[1]))//2-bb[1]),label,font=f,fill=WHITE)

def banner(size,mobile=False):
    W,H=size; im=gradient(size,'#FFFFFF','#EAF7FF'); d=ImageDraw.Draw(im)
    waves(im,int(H*(.74 if not mobile else .72)))
    if mobile:
        draw_skyline(im,int(W*.30),int(H*.735),int(W*.38),int(H*.13))
    else:
        draw_skyline(im,int(W*.37),int(H*.755),int(W*.27),int(H*.14))
    r=int(H*(.14 if not mobile else .10)); sx=int(W*(.84 if not mobile else .83)); sy=int(H*.22)
    d.ellipse((sx-r,sy-r,sx+r,sy+r),fill=YELLOW)
    if mobile:
        place(im,horizontal,(int(W*.045),int(H*.04),int(W*.48),int(H*.13)))
        place(im,mark,(int(W*.66),int(H*.18),int(W*.27),int(H*.38)))
        x=int(W*.055)
        d.multiline_text((x,int(H*.21)),'Groceries,\nbought together.',font=font(int(H*.087),True),fill=NAVY,spacing=2)
        d.multiline_text((x,int(H*.48)),'Local food. Real savings.\nA stronger Halifax.',font=font(int(H*.04)),fill=NAVY,spacing=2)
    else:
        place(im,horizontal,(int(W*.05),int(H*.035),int(W*.24),int(H*.13)))
        place(im,mark,(int(W*.71),int(H*.10),int(W*.20),int(H*.46)))
        x=int(W*.055)
        d.multiline_text((x,int(H*.23)),'Groceries,\nbought together.',font=font(int(H*.10),True),fill=NAVY,spacing=int(H*.01))
        d.text((x,int(H*.54)),'Local food. Real savings. A stronger Halifax.',font=font(int(H*.037)),fill=NAVY)
        button(d,(x,int(H*.62),x+int(W*.18),int(H*.73)),'Start a Group Buy',int(H*.031))
    return im

for name,size,mobile in [
    ('hero-desktop-1920x600',(1920,600),False),('hero-tablet-1024x400',(1024,400),False),
    ('hero-mobile-390x260',(390,260),True),('email-header-1200x400',(1200,400),False)
]:
    im=banner(size,mobile); optimize_png(im,OUT/'03-banners'/(name+'.png'),128); save_webp(im,OUT/'03-banners'/(name+'.webp'))

og=banner((1200,630),False); optimize_png(og,OUT/'05-social/open-graph-1200x630.png',128); save_webp(og,OUT/'05-social/open-graph-1200x630.webp')
W=H=1080; sq=gradient((W,H),'#FFFFFF','#EAF7FF'); waves(sq,820); draw_skyline(sq,240,820,420,150); place(sq,mark,(290,70,500,420)); d=ImageDraw.Draw(sq)
txt='Groceries,\nbought together.'; f=font(70,True); bb=d.multiline_textbbox((0,0),txt,font=f,spacing=8)
d.multiline_text(((W-(bb[2]-bb[0]))//2,470),txt,font=f,fill=NAVY,spacing=8,align='center')
sub='LOCAL FOOD. STRONGER TOGETHER.'; ff=font(26,True); bb=d.textbbox((0,0),sub,font=ff)
d.text(((W-(bb[2]-bb[0]))//2,675),sub,font=ff,fill=NAVY)
optimize_png(sq,OUT/'05-social/social-square-1080x1080.png',128)

# UI files
TOKENS={'brand':{'navy':NAVY,'ocean':OCEAN,'sky':SKY,'green':GREEN,'yellow':YELLOW},'surface':{'background':LIGHT,'card':WHITE,'border':BORDER},'text':{'primary':NAVY,'muted':MUTED,'inverse':WHITE},'radius':{'sm':'8px','md':'12px','lg':'18px','pill':'999px'},'font':{'family':'Poppins, Inter, system-ui, sans-serif','weight':{'regular':400,'medium':500,'semibold':600,'bold':700}}}
(OUT/'04-ui/design-tokens.json').write_text(json.dumps(TOKENS,indent=2))
(OUT/'04-ui/css/harbourcart-tokens.css').write_text(f''':root {{
  --hc-navy: {NAVY};
  --hc-ocean: {OCEAN};
  --hc-sky: {SKY};
  --hc-green: {GREEN};
  --hc-yellow: {YELLOW};
  --hc-bg: {LIGHT};
  --hc-surface: #FFFFFF;
  --hc-border: {BORDER};
  --hc-text: {NAVY};
  --hc-muted: {MUTED};
  --hc-font: Poppins, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}}
''')
(OUT/'04-ui/css/harbourcart-components.css').write_text('''@import "./harbourcart-tokens.css";
.hc-btn{display:inline-flex;align-items:center;justify-content:center;gap:.55rem;min-height:48px;padding:0 1.25rem;border-radius:999px;border:1px solid transparent;font:600 15px/1 var(--hc-font);cursor:pointer;transition:.15s ease}
.hc-btn:focus-visible{outline:3px solid rgba(30,136,229,.30);outline-offset:2px}
.hc-btn--primary{background:var(--hc-ocean);color:#fff;box-shadow:0 6px 18px rgba(30,136,229,.24)}
.hc-btn--primary:hover{transform:translateY(-1px);background:#0875d0}
.hc-btn--secondary{background:#fff;color:var(--hc-ocean);border-color:#8dc8f0}
.hc-btn--secondary:hover{background:#eef8ff}
.hc-btn--local{background:var(--hc-green);color:#fff}
.hc-btn--ghost{background:transparent;color:var(--hc-navy)}
.hc-chip{display:inline-flex;align-items:center;min-height:38px;padding:0 16px;border-radius:999px;background:#eef4f8;color:var(--hc-navy);font:500 14px/1 var(--hc-font)}
.hc-chip[data-active="true"]{background:var(--hc-navy);color:#fff}
''')
(OUT/'04-ui/react/HarbourButton.tsx').write_text('''import type { ButtonHTMLAttributes, ReactNode } from "react";
import "../css/harbourcart-components.css";
type Variant = "primary" | "secondary" | "local" | "ghost";
export function HarbourButton({variant="primary",children,...props}: ButtonHTMLAttributes<HTMLButtonElement> & {variant?:Variant;children:ReactNode}) {
  return <button className={`hc-btn hc-btn--${variant}`} {...props}>{children}</button>;
}
''')
svgs={
'location':'<path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.3"/>',
'cart':'<path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>',
'users':'<circle cx="9" cy="8" r="3"/><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19"/><circle cx="17" cy="9" r="2.4"/><path d="M15.7 14h1.1a4 4 0 0 1 4 4v1"/>',
'check':'<path d="m5 12 4 4L19 6"/>','arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>','plus':'<path d="M12 5v14M5 12h14"/>','search':'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>','leaf':'<path d="M20 4C12 4 6 8.7 6 15c0 2.8 2.2 5 5 5 6.3 0 9-7.2 9-16Z"/><path d="M6 20c2.6-5 6-8.4 11-11"/>'}
for name,body in svgs.items():
    (OUT/'04-ui/icons'/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="{NAVY}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">{body}</svg>')
(OUT/'04-ui/preview.html').write_text('''<!doctype html><meta charset="utf-8"><title>HarbourCart brand assets</title><style>body{font-family:system-ui;padding:32px;background:#f6fafe;color:#0b315e}img{max-width:700px;background:white;border:1px solid #dde7f0;border-radius:16px;padding:18px}</style><h1>HarbourCart approved brand assets</h1><img src="../01-logos/harbourcart-logo-horizontal-fullcolor.png">''')

(OUT/'README.md').write_text('''# HarbourCart approved brand assets

This folder is generated from the project owner's approved **lighthouse-in-cart HarbourCart identity**. The earlier ZIP is used only as the checklist for which deliverables to include; none of its experimental artwork is reused.

## Brand baseline
- Approved mark: lighthouse + Halifax/harbour skyline + waves inside a shopping cart
- Wordmark: HarbourCart
- Tagline: **LOCAL FOOD. STRONGER TOGETHER.**
- Primary font direction: Poppins (Inter/system UI fallback)
- Harbour Navy: #0B315E
- Ocean Blue: #1E88E5
- Sky Blue: #A7D4F2
- Fresh Green: #2E7D32
- Harbour Yellow: #FFD166

The full-colour horizontal logo is the default header/marketing logo. The icon-only mark is for app icons, favicons and compact mobile contexts. Use reverse/white artwork on navy or dark photography.
''')
(OUT/'06-docs/IMPLEMENTATION-NOTES.md').write_text('''# Implementation notes

1. Treat the approved lighthouse-cart mark as locked.
2. Do not substitute the earlier H/wave, grocery-bag or generic cart concepts.
3. Use the horizontal full-colour logo on light surfaces and reverse art on dark surfaces.
4. Use icon-only artwork for small/mobile contexts.
5. Banner artwork follows the supplied mobile asset kit: light sky, Halifax skyline, ocean waves, navy/blue typography and restrained yellow accent.
6. Keep actual app copy as live HTML text whenever practical for accessibility and responsive behavior.
7. No font binaries are included; Poppins should be loaded by the app separately if licensed/available.
''')
items=[]
for p in sorted(OUT.rglob('*')):
    if p.is_file() and p.name!='asset-inventory.json': items.append({'path':str(p.relative_to(OUT)),'bytes':p.stat().st_size})
(OUT/'asset-inventory.json').write_text(json.dumps({'count':len(items),'files':items},indent=2))
print(f'Generated {len(items)+1} HarbourCart files under {OUT}')
