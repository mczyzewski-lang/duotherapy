#!/usr/bin/env python3
"""Spot 15 s „terapia małżeńska online”: lektor (frazy wycięte z nagrania, pauzy skrócone), oś czasu, miks, render.
Użycie: python3 spot.py vo | tl | stills <t…> | build"""
import json,os,subprocess,sys,shutil
FPS=25;V=os.environ.get('V','2');OUT='spot/output'
if V=='1':  # wersja 15 s: skrócony tekst, pauzy ścięte, tempo ×1,12
    DUR=15.0;N='duo_terapia_malzenska_15s_v1';MUSIC='spot/raw/music.mp3';CARD=12.5;TAG=None
else:       # wersja pełna: cały tekst z naturalnymi pauzami + czytane zakończenie na planszy
    DUR=22.2;N='duo_terapia_malzenska_22s_v2';MUSIC='spot/raw/music2.mp3';CARD=17.75;TAG=('spot/raw/tag.mp3',CARD+0.45)
def sh(c): subprocess.run(c,shell=True,check=True)
PHR=[(0.00,3.05,0.08),(3.56,4.85,2.92),(5.29,6.59,4.27),(7.20,9.40,5.55),(9.79,10.92,7.66),(11.21,13.77,8.78),(14.13,15.99,11.16)]
def vo():
    os.makedirs(OUT,exist_ok=True)
    if V=='1':
        TEMPO=1.12;parts=[]
        for i,(a,b,t) in enumerate(PHR):
            a=max(0,a-0.04);b=b+0.10;d=(b-a)/TEMPO
            parts.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,atempo={TEMPO},afade=t=in:d=0.02,afade=t=out:st={d-0.09:.3f}:d=0.09,adelay={int(t*1000)}:all=1[p{i}]")
        f=';'.join(parts)+';'+''.join(f'[p{i}]' for i in range(len(PHR)))+f"amix=inputs={len(PHR)}:normalize=0,apad,atrim=0:{DUR},loudnorm=I=-16:TP=-1.5:LRA=11[o]"
        sh(f"ffmpeg -nostdin -v error -y -i spot/raw/vo3.mp3 -filter_complex \"{f}\" -map \"[o]\" -ar 48000 -ac 2 -c:a pcm_s16le {OUT}/{N}_voiceover.wav")
    else:
        f=(f"[0:a]adelay=200:all=1[a];[1:a]adelay={int(TAG[1]*1000)}:all=1[b];[a][b]amix=inputs=2:normalize=0,apad,atrim=0:{DUR},loudnorm=I=-16:TP=-1.5:LRA=11[o]")
        sh(f"ffmpeg -nostdin -v error -y -i spot/raw/vo1.mp3 -i {TAG[0]} -filter_complex \"{f}\" -map \"[o]\" -ar 48000 -ac 2 -c:a pcm_s16le {OUT}/{N}_voiceover.wav")
# napisy: słowa z transkrypcji nagrania (czas w pliku lektora), dzielone na krótkie frazy
W=[("Jeszcze",.08,.32),("niedawno",.36,.8),("nie",.88,.96),("umieliśmy",1.04,1.52),("już",1.56,1.68),("ze",1.72,1.76),("sobą",1.84,2.08),("rozmawiać…",2.16,3.2),
 ("Byliśmy",3.52,3.92),("obok",4.0,4.16),("siebie…",4.24,4.96),("ale",5.28,5.44),("coraz",5.52,5.76),("dalej",5.84,6.08),("od",6.16,6.24),("siebie.",6.32,6.92),
 ("W",7.28,7.32),("końcu",7.36,7.84),("postanowiliśmy",7.96,8.64),("poszukać",8.72,9.04),("pomocy.",9.12,9.8),
 ("Ktoś",10.07,10.28),("nas",10.32,10.48),("wysłuchał…",10.52,11.48),("pomógł",11.52,11.84),("nam",11.92,12.08),("nazwać",12.16,12.56),("to,",12.64,12.76),
 ("co",12.8,12.88),("się",12.92,13.04),("między",13.08,13.28),("nami",13.32,13.52),("zgubiło…",13.6,14.6),
 ("i",14.86,14.88),("pomógł",14.92,15.28),("nam",15.36,15.44),("znów",15.52,15.84),("usłyszeć",15.92,16.4),("siebie",16.48,16.64),("nawzajem.",16.68,17.52)]
CUT=[4,8,11,16,21,24,28,33,36,40]
def caps(off=0.2):
    out=[];i=0
    for j in CUT:
        ws=[[w,round(a+off,3),round(b+off,3)] for w,a,b in W[i:j]]
        for k in range(len(ws)-1): ws[k][2]=ws[k+1][1]
        out.append(dict(a=round(ws[0][1]-0.1,3),b=round(ws[-1][2]+0.12,3),words=ws));i=j
    for k in range(len(out)-1): out[k]['b']=min(out[k]['b'],out[k+1]['a'])
    return out
def timeline():
    n=lambda k: len(os.listdir(f'clips/sp_{k}'))
    if V=='1': S=[dict(id='s1',a=0,b=2.86,off=0.0),dict(id='s2',a=2.86,b=5.5,off=0.9),dict(id='s3',a=5.5,b=6.12,off=2.3),dict(kind='phone',bg='s3',bgA=5.5-2.3,a=6.12,b=7.62),
        dict(kind='call',id='s4a',pip='s4b',a=7.62,b=9.0,off=1.7,zoom=0.0),dict(id='s4b',a=9.0,b=11.12,off=0.9),dict(id='s5',a=11.12,b=DUR+0.2,off=0.0,card=CARD)]
    else: S=[dict(id='s1',a=0,b=3.4,off=0.0),dict(id='s2',a=3.4,b=7.2,off=0.0),dict(id='s3',a=7.2,b=8.05,off=2.1),dict(kind='phone',bg='s3',bgA=7.2-2.1,a=8.05,b=10.1,ts=0.75),
        dict(kind='call',id='s4a',pip='s4b',a=10.1,b=11.65,off=2.3,zoom=0.0),dict(id='s4b',a=11.65,b=14.75,off=0.3),dict(id='s5',a=14.75,b=DUR+0.2,off=0.0,card=CARD)]
    tl=dict(dur=DUR,card=CARD,pip=[185,662,530,366],clips={k:n(k) for k in ['s1','s2','s3','s4a','s4b','s5']},shots=S)
    if V!='1': tl['caps']=caps()
    json.dump(tl,open('spot/tl.json','w'),ensure_ascii=False,indent=1);return tl
def lvl(f,d=None):
    r=subprocess.run(f"ffmpeg -nostdin -i {f} {'-t %s'%d if d else ''} -af volumedetect -f null -",shell=True,capture_output=True,text=True).stderr
    return float(r.split('mean_volume:')[1].split('dB')[0])
def audio():
    tl=json.load(open('spot/tl.json'));S=tl['shots'];ph=next(x for x in S if x.get('kind')=='phone');ts=ph.get('ts',1)
    by=lambda k: next(x for x in S if x.get('id')==k);s1,s2,s3,s5=by('s1'),by('s2'),by('s3'),by('s5');call=next(x for x in S if x.get('kind')=='call')
    # tło i smaczki: (plik, początek, długość, docelowy średni poziom dB, narastanie, wygaszanie)
    L=[('spot/raw/sfx_kitchen.mp3',0.0,s1['b']+0.3,-33,0.3,0.5),          # kuchnia wieczorem: lodówka, zegar
       ('spot/raw/sfx_tv.mp3',s2['a']-0.15,s2['b']-s2['a']+0.4,-31,0.4,0.6), # telewizor przy kanapie
       ('spot/raw/sfx_kettle.mp3',s3['a']-0.1,min(3.9,ph['b']-s3['a']),-32,0.4,0.9), # poranek: czajnik, ptaki
       ('sfx_pop.mp3',ph['a']+0.6/ts,0.4,-27,0,0.05),('sfx_pop.mp3',ph['a']+1.12/ts,0.4,-26,0,0.05), # dotknięcia ekranu
       ('spot/raw/sfx_call.mp3',call['a']+0.05,1.45,-27,0.01,0.3),            # połączenie wideo
       ('spot/raw/sfx_chop.mp3',s5['a']+0.05,min(3.4,CARD-s5['a']+0.5),-30,0.3,0.9), # kuchnia: krojenie, garnek
       ('sfx_chime.mp3',CARD+0.1,2.5,-27,0.01,0.8)]                            # miękki znak dźwiękowy na planszy
    ins=f"-i {OUT}/{N}_voiceover.wav -i {MUSIC} "+' '.join(f"-i {x[0]}" for x in L)
    f=(f"[0:a]asplit[v][vs];[1:a]atrim=0:{DUR},afade=t=in:d=0.5,afade=t=out:st={DUR-1.1}:d=1.1,volume=0.5[m0];[m0][vs]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450[m];")
    for n,(fn,t0,d,db,fi,fo) in enumerate(L):
        g=db-lvl(fn,d);t0=max(0,t0)
        f+=f"[{n+2}:a]atrim=0:{d:.2f},asetpts=PTS-STARTPTS,volume={g:.1f}dB,afade=t=in:d={max(fi,0.005)},afade=t=out:st={max(0,d-fo):.2f}:d={fo},adelay={int(t0*1000)}:all=1[x{n}];"
    f+="[v][m]"+''.join(f"[x{n}]" for n in range(len(L)))+f"amix=inputs={len(L)+2}:normalize=0:duration=longest,alimiter=limit=0.94,apad,atrim=0:{DUR}[o]"
    sh(f"ffmpeg -nostdin -v error -y {ins} -filter_complex \"{f}\" -map \"[o]\" -c:a aac -b:a 256k -ar 48000 spot/mix.m4a")
def build():
    tl=timeline();vo();audio();Nf=round(DUR*FPS);fd='spot/frames';shutil.rmtree(fd,ignore_errors=True);os.makedirs(fd);q=[0,Nf//3,2*Nf//3,Nf]
    pr=[subprocess.Popen(f"PAGE=spot.html TL=spot/tl.json OUT={fd} FPS={FPS} node render.js frames {q[i]} {q[i+1]}",shell=True,stdout=subprocess.DEVNULL) for i in range(3)]
    for x in pr: x.wait()
    assert len(os.listdir(fd))==Nf,len(os.listdir(fd))
    o=f'{OUT}/{N}.mp4'
    sh(f"ffmpeg -nostdin -v error -y -framerate {FPS} -i {fd}/f%05d.jpg -i spot/mix.m4a -t {DUR} -c:v libx264 -preset slow -crf 17 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -profile:v high -r {FPS} -movflags +faststart -c:a copy {o}")
    sh(f"cp {fd}/f{Nf-1:05d}.jpg /tmp/_ff.jpg && ffmpeg -nostdin -v error -y -i /tmp/_ff.jpg {OUT}/{N}_finalframe.png && rm /tmp/_ff.jpg")
    print(o)
if __name__=='__main__':
    m=sys.argv[1]
    if m=='vo': vo()
    elif m=='tl': timeline()
    elif m=='stills': timeline();sh("PAGE=spot.html TL=spot/tl.json node render.js stills "+' '.join(sys.argv[2:]))
    elif m=='build': build()
