#!/usr/bin/env python3
"""Spot „terapia małżeńska online” – wersja pełna z czytanym hookiem.
Użycie:  G=F python3 spot.py build        – wersja bazowa, narracja kobieca (G=M – męska, z mężczyzną przy telefonie)
         H=H01 python3 spot.py build      – wariant: czytany hook + własne pierwsze ujęcie doklejone przed filmem bazowym
Cięcia wynikają z czasów słów w nagraniu lektora (transkrypcja), więc pasują do obu głosów.
Wersja 15 s (skrócony tekst): spot_v1.py."""
import json,os,re,subprocess,sys,shutil
FPS=25;OUT='spot/output';OFF=0.2
HOOKS={ # klucz: (linie nagłówka, indeks linii w plakietce, tło dźwiękowe ujęcia, płeć narratora, przesunięcie kadru w dół)
 'H01':(["Zostać","czy się rozstać?"],1,'sfx_home.mp3','F',0),
 'H02':(["Kiedy ostatnio","naprawdę","rozmawialiście?"],1,'spot/raw/sfx_kitchen.mp3','F',0),
 'H03':(["Mieszkacie razem.","Żyjecie osobno."],1,'sfx_home.mp3','F',130),
 'H04':(["Znowu kłótnia","o to samo?"],1,'sfx_home.mp3','F',250),
 'H05':(["Jedno łóżko.","Dwa osobne światy."],1,'sfx_home.mp3','F',0),
 'H06':(["On milczy.","Ona już nie pyta."],1,'spot/raw/sfx_car.mp3','F',0),
 'H07':(["Jeszcze para","czy już tylko","rodzice?"],2,'spot/raw/sfx_kitchen.mp3','F',150),
 'H08':(["Myślisz","o rozwodzie?"],1,'spot/raw/sfx_city.mp3','M',70),   # otwiera mężczyzna → cała narracja męska
 'H09':(["Kiedy ostatnio","się przytuliliście?"],1,'spot/raw/sfx_tv.mp3','F',160),
 'H10':(["To jeszcze kryzys","czy już koniec?"],1,'spot/raw/sfx_city.mp3','F',0)}
H=os.environ.get('H');G=HOOKS[H][3] if H else os.environ.get('G','F')
TXT="Jeszcze niedawno nie umieliśmy już ze sobą rozmawiać… Byliśmy obok siebie… ale coraz dalej od siebie. W końcu postanowiliśmy poszukać pomocy. Ktoś nas wysłuchał… pomógł nam nazwać to, co się między nami zgubiło… i pomógł nam znów usłyszeć siebie nawzajem.".split()
# czasy słów (początek, koniec) z transkrypcji nagrań lektorów
TIMES={'F':[(.08,.32),(.36,.8),(.88,.96),(1.04,1.52),(1.56,1.68),(1.72,1.76),(1.84,2.08),(2.16,3.2),(3.52,3.92),(4.0,4.16),(4.24,4.96),(5.28,5.44),(5.52,5.76),(5.84,6.08),(6.16,6.24),(6.32,6.92),
  (7.28,7.32),(7.36,7.84),(7.96,8.64),(8.72,9.04),(9.12,9.8),(10.07,10.28),(10.32,10.48),(10.52,11.48),(11.52,11.84),(11.92,12.08),(12.16,12.56),(12.64,12.76),(12.8,12.88),(12.92,13.04),(13.08,13.28),(13.32,13.52),(13.6,14.6),
  (14.86,14.88),(14.92,15.28),(15.36,15.44),(15.52,15.84),(15.92,16.4),(16.48,16.64),(16.68,17.52)],
 'M':[(.08,.4),(.48,.88),(.96,1.04),(1.12,1.52),(1.6,1.72),(1.76,1.84),(1.92,2.16),(2.24,3.32),(3.76,4.16),(4.24,4.4),(4.48,5.24),(5.6,5.76),(5.84,6.16),(6.28,6.48),(6.56,6.64),(6.72,7.28),
  (7.6,7.68),(7.8,8.32),(8.4,9.12),(9.2,9.6),(9.64,10.32),(10.64,10.88),(10.96,11.04),(11.12,12.12),(12.16,12.48),(12.6,12.72),(12.84,13.2),(13.28,13.48),(13.52,13.6),(13.68,13.79),(13.81,14.0),(14.08,14.24),(14.32,15.08),
  (15.58,15.6),(15.64,16.0),(16.08,16.24),(16.32,16.64),(16.72,17.25),(17.31,17.44),(17.52,18.32)]}
VOICE={'F':dict(vo='spot/raw/vo1.mp3',tag='spot/raw/tag.mp3',s3='s3',s3off=2.1,name='ona'),'M':dict(vo='spot/raw/voM.mp3',tag='spot/raw/tagM.mp3',s3='s3m',s3off=1.2,name='on')}[G]
W=[(w,a,b) for w,(a,b) in zip(TXT,TIMES[G])];assert len(W)==40
CUT=[4,8,11,16,21,24,28,33,36,40];LINK=dict(enter=4.25,click=5.25);MUSIC='spot/raw/music2.mp3'
g25=lambda x: round(x*FPS)/FPS
def sh(c): subprocess.run(c,shell=True,check=True)
def span(f):
    """początek i koniec mowy w pliku (bez ciszy na brzegach)"""
    r=subprocess.run(f"ffmpeg -nostdin -i {f} -af silencedetect=noise=-40dB:d=0.12 -f null -",shell=True,capture_output=True,text=True).stderr
    d=float(re.search(r'Duration: (\d+):(\d+):([\d.]+)',r).group(3));ss=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',r)];se=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',r)]
    a=se[0] if ss and ss[0]<0.05 and se else 0.0;b=ss[-1] if ss and (len(se)<len(ss) or se[-1]>d-0.05) else d
    return a,b
# ── oś czasu: cięcia z czasów słów; z hookiem całość przesuwa się o T0
if H: hs,he=span(f'spot/raw/hk_{H}.mp3');T0=g25(0.2+(he-hs)+0.5)
else: T0=0.0
st=lambda i: W[i][1]+OFF
C1,C2,C3,C4,C5,C6=[g25(x) for x in (st(8)-0.3,st(16)-0.28,st(18)-0.11,st(21)-0.17,st(24)-0.07,st(33)-0.31)]
CARD0=g25(W[39][2]+OFF+0.03);DUR0=g25(CARD0+6.24);CARD=g25(CARD0+T0);DUR=g25(DUR0+T0)
N=f'duo_spot_{H}' if H else f'duo_spot_bazowy_{VOICE["name"]}'
def caps():
    out=[];i=0
    for j in CUT:
        ws=[[w,round(a+OFF+T0,3),round(b+OFF+T0,3)] for w,a,b in W[i:j]]
        for k in range(len(ws)-1): ws[k][2]=ws[k+1][1]
        out.append(dict(a=round(ws[0][1]-0.1,3),b=round(ws[-1][2]+0.12,3),words=ws));i=j
    for k in range(len(out)-1): out[k]['b']=min(out[k]['b'],out[k+1]['a'])
    return out
def timeline():
    n=lambda k: len(os.listdir(f'clips/sp_{k}'));s3=VOICE['s3'];T=T0
    S=[dict(id='s1',a=T,b=C1+T,off=0.0),dict(id='s2',a=C1+T,b=C2+T,off=0.0),dict(id=s3,a=C2+T,b=C3+T,off=VOICE['s3off']),
       dict(kind='phone',bg=s3,bgA=C2+T-VOICE['s3off'],a=C3+T,b=C4+T,ts=round(1.5/(C4-C3),3)),
       dict(kind='call',id='s4a',pip='s4b',a=C4+T,b=C5+T,off=2.3,zoom=0.0),dict(id='s4b',a=C5+T,b=C6+T,off=0.3),dict(id='s5',a=C6+T,b=DUR+0.2,off=0.0,card=CARD)]
    ids=['s1','s2',s3,'s4a','s4b','s5']
    if H: S.insert(0,dict(id=H.lower(),a=0,b=T,off=0.0,dy=HOOKS[H][4]));ids.append(H.lower())
    tl=dict(dur=DUR,card=CARD,pip=[225,722,449,310],clips={k:n(k) for k in ids},shots=S,caps=caps(),link=LINK)
    if H: tl['hook']=dict(lines=HOOKS[H][0],pill=HOOKS[H][1],b=T-0.3,fs=96 if max(len(x) for x in HOOKS[H][0])<=15 else 84,y=455 if len(HOOKS[H][0])>2 else 520)
    json.dump(tl,open('spot/tl.json','w'),ensure_ascii=False,indent=1);return tl
def vo():
    os.makedirs(OUT,exist_ok=True);ins=f"-i {VOICE['vo']} -i {VOICE['tag']}"
    f=f"[0:a]adelay={int((OFF+T0)*1000)}:all=1[a];[1:a]adelay={int((CARD+0.45)*1000)}:all=1[b];";mix="[a][b]";k=2
    if H: ins+=f" -ss {hs:.3f} -i spot/raw/hk_{H}.mp3";f+="[2:a]afade=t=in:d=0.03,adelay=200:all=1[h];";mix+="[h]";k=3
    f+=f"{mix}amix=inputs={k}:normalize=0,apad,atrim=0:{DUR},loudnorm=I=-16:TP=-1.5:LRA=11[o]"
    sh(f"ffmpeg -nostdin -v error -y {ins} -filter_complex \"{f}\" -map \"[o]\" -ar 48000 -ac 2 -c:a pcm_s16le spot/vo.wav")
def lvl(f,d=None):
    r=subprocess.run(f"ffmpeg -nostdin -i {f} {'-t %s'%d if d else ''} -af volumedetect -f null -",shell=True,capture_output=True,text=True).stderr
    return float(r.split('mean_volume:')[1].split('dB')[0])
def audio():
    tl=json.load(open('spot/tl.json'));S=tl['shots'];ph=next(x for x in S if x.get('kind')=='phone');ts=ph.get('ts',1)
    by=lambda k: next(x for x in S if x.get('id')==k);s1,s2,s3,s5=by('s1'),by('s2'),by(VOICE['s3']),by('s5');call=next(x for x in S if x.get('kind')=='call')
    # tło i smaczki: (plik, początek, długość, docelowy średni poziom dB, narastanie, wygaszanie)
    L=[('spot/raw/sfx_kitchen.mp3',s1['a']-0.1,s1['b']-s1['a']+0.4,-33,0.3,0.5),      # kuchnia wieczorem: lodówka, zegar
       ('spot/raw/sfx_tv.mp3',s2['a']-0.15,s2['b']-s2['a']+0.4,-31,0.4,0.6),            # telewizor przy kanapie
       ('spot/raw/sfx_kettle.mp3',s3['a']-0.1,min(3.9,ph['b']-s3['a']),-32,0.4,0.9),    # poranek: czajnik, ptaki
       ('sfx_pop.mp3',ph['a']+0.6/ts,0.4,-27,0,0.05),('sfx_pop.mp3',ph['a']+1.12/ts,0.4,-26,0,0.05), # dotknięcia ekranu
       ('spot/raw/sfx_call.mp3',call['a']+0.05,1.45,-27,0.01,0.3),                      # połączenie wideo
       ('spot/raw/sfx_simmer.mp3',s5['a']+0.05,min(3.6,CARD-s5['a']+0.6),-31,0.4,1.0),  # kuchnia wieczorem: cicho gotujący się garnek
       ('sfx_pop.mp3',CARD+LINK['click'],0.4,-24,0,0.05)]                               # kliknięcie w adres
    if H: L.append((HOOKS[H][2],0.0,min(3.9,T0+0.3),-32,0.25,0.5))                       # tło ujęcia z hookiem
    ins=f"-i spot/vo.wav -i {MUSIC} "+' '.join(f"-i {x[0]}" for x in L)
    f=(f"[0:a]asplit=3[v][vs][vj];[1:a]atrim=0:{DUR},afade=t=in:d=0.5,afade=t=out:st={CARD-0.5}:d=1.3,volume=0.5[m0];[m0][vs]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450[m];")
    for n,(fn,t0,d,db,fi,fo) in enumerate(L):
        g=db-lvl(fn,d);t0=max(0,t0)
        f+=f"[{n+2}:a]atrim=0:{d:.2f},asetpts=PTS-STARTPTS,volume={g:.1f}dB,afade=t=in:d={max(fi,0.005)},afade=t=out:st={max(0,d-fo):.2f}:d={fo},adelay={int(t0*1000)}:all=1[x{n}];"
    ins+=" -i spot/raw/jingle.mp3";k=len(L)+2
    f+=f"[{k}:a]volume=-2dB,afade=t=out:st=5.6:d=1.2,adelay={int(CARD*1000)}:all=1[j0];[j0][vj]sidechaincompress=threshold=0.03:ratio=4:attack=30:release=400[jg];"
    f+="[v][m][jg]"+''.join(f"[x{n}]" for n in range(len(L)))+f"amix=inputs={len(L)+3}:normalize=0:duration=longest,alimiter=limit=0.94,apad,atrim=0:{DUR}[o]"
    sh(f"ffmpeg -nostdin -v error -y {ins} -filter_complex \"{f}\" -map \"[o]\" -c:a aac -b:a 256k -ar 48000 spot/mix.m4a")
def render(fd,a,b):
    q=[a+(b-a)*i//3 for i in range(4)]
    pr=[subprocess.Popen(f"PAGE=spot.html TL=spot/tl.json OUT={fd} FPS={FPS} node render.js frames {q[i]} {q[i+1]}",shell=True,stdout=subprocess.DEVNULL) for i in range(3)]
    for x in pr: x.wait()
def build():
    tl=timeline();vo();audio();Nf=round(DUR*FPS);base=f'spot/frames_base_{G}';Nb=round(DUR0*FPS)
    if H:   # wariant: renderujemy hook i przejście, resztę klatek bierzemy z wersji bazowej (przesuniętej o T0)
        assert len(os.listdir(base))==Nb,'najpierw zbuduj wersję bazową dla G='+G
        sft=round(T0*FPS);n0=sft+round(0.32*FPS);fd='spot/frames_h';shutil.rmtree(fd,ignore_errors=True);os.makedirs(fd);render(fd,0,n0)
        for i in range(n0,Nf): os.symlink(os.path.abspath(f'{base}/f{i-sft:05d}.jpg'),f'{fd}/f{i:05d}.jpg')
    else:
        fd=base;shutil.rmtree(fd,ignore_errors=True);os.makedirs(fd);render(fd,0,Nf)
    assert len(os.listdir(fd))==Nf,(len(os.listdir(fd)),Nf);o=f'{OUT}/{N}.mp4'
    sh(f"ffmpeg -nostdin -v error -y -framerate {FPS} -i {fd}/f%05d.jpg -i spot/mix.m4a -t {DUR} -c:v libx264 -preset slow -crf 17 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -profile:v high -r {FPS} -movflags +faststart -c:a copy {o}")
    print(o,'%.2f s'%DUR,'T0=%.2f'%T0,G)
if __name__=='__main__':
    m=sys.argv[1]
    if m=='plan': print(N,G,'T0',T0,'cięcia',C1,C2,C3,C4,C5,C6,'plansza',CARD,'dł.',DUR)
    elif m=='tl': timeline()
    elif m=='stills': timeline();sh("PAGE=spot.html TL=spot/tl.json node render.js stills "+' '.join(sys.argv[2:]))
    elif m=='build': build()
