#!/usr/bin/env python3
"""Spot 15 s „terapia małżeńska online”: lektor (frazy wycięte z nagrania, pauzy skrócone), oś czasu, miks, render.
Użycie: python3 spot.py vo | tl | stills <t…> | build"""
import json,os,subprocess,sys,shutil
FPS=25;DUR=15.0;TEMPO=1.12;VO='spot/raw/vo3.mp3';OUT='spot/output';N='duo_terapia_malzenska_15s_v1'
def sh(c): subprocess.run(c,shell=True,check=True)
# frazy w nagraniu (początek, koniec) i ich miejsce w filmie (początek)
PHR=[(0.00,3.05,0.08),(3.56,4.85,2.92),(5.29,6.59,4.27),(7.20,9.40,5.55),(9.79,10.92,7.66),(11.21,13.77,8.78),(14.13,15.99,11.16)]
def vo():
    os.makedirs(OUT,exist_ok=True);parts=[];ins=''
    for i,(a,b,t) in enumerate(PHR):
        a=max(0,a-0.04);b=b+0.10;d=(b-a)/TEMPO
        parts.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,atempo={TEMPO},afade=t=in:d=0.02,afade=t=out:st={d-0.09:.3f}:d=0.09,adelay={int(t*1000)}:all=1[p{i}]")
        print('fraza',i+1,'%.2f–%.2f'%(t,t+d))
    f=';'.join(parts)+';'+''.join(f'[p{i}]' for i in range(len(PHR)))+f"amix=inputs={len(PHR)}:normalize=0,apad,atrim=0:{DUR},loudnorm=I=-16:TP=-1.5:LRA=11[o]"
    sh(f"ffmpeg -nostdin -v error -y -i {VO} -filter_complex \"{f}\" -map \"[o]\" -ar 48000 -ac 2 -c:a pcm_s16le {OUT}/{N}_voiceover.wav")
def timeline():
    n=lambda k: len(os.listdir(f'clips/sp_{k}'))
    tl=dict(dur=DUR,card=12.5,pip=[160,590,600,415],clips={k:n(k) for k in ['s1','s2','s3','s4a','s4b','s5']},shots=[
      dict(id='s1',a=0,b=2.86,off=0.0),
      dict(id='s2',a=2.86,b=5.5,off=0.9),
      dict(id='s3',a=5.5,b=6.12,off=0.6),
      dict(kind='phone',bg='s3',bgA=5.5-0.6,a=6.12,b=7.62),
      dict(kind='call',id='s4a',pip='s4b',a=7.62,b=9.0,off=1.7,zoom=0.0),
      dict(id='s4b',a=9.0,b=11.12,off=0.9),
      dict(id='s5',a=11.12,b=DUR+0.2,off=0.0,card=12.5)])
    json.dump(tl,open('spot/tl.json','w'),indent=1);return tl
def audio():
    # muzyka pod lektorem (ducking), ambient domu na początku, klik i sygnał połączenia, krojenie w kuchni, miękki znak dźwiękowy na końcu
    f=(f"[0:a]asplit[v][vs];[1:a]atrim=0:{DUR},afade=t=in:d=0.5,afade=t=out:st={DUR-0.9}:d=0.9,volume=0.5[m0];[m0][vs]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450[m];"
       f"[2:a]atrim=0:5.7,volume=0.30,afade=t=in:d=0.4,afade=t=out:st=5.0:d=0.7[amb];"
       f"[3:a]asplit[pa][pb];[pa]volume=0.22,adelay=6740:all=1[t1];[pb]volume=0.26,adelay=7260:all=1[t2];"
       f"[4:a]atrim=0:1.6,volume=0.20,afade=t=in:d=0.25,afade=t=out:st=1.0:d=0.6,adelay=11150:all=1[ch];"
       f"[5:a]volume=0.22,adelay=12600:all=1[br];"
       f"[v][m][amb][t1][t2][ch][br]amix=inputs=7:normalize=0:duration=longest,alimiter=limit=0.94,apad,atrim=0:{DUR}[o]")
    sh(f"ffmpeg -nostdin -v error -y -i {OUT}/{N}_voiceover.wav -i spot/raw/music.mp3 -stream_loop -1 -i sfx_home.mp3 -i sfx_pop.mp3 -i spot/raw/sfx_chop.mp3 -i sfx_chime.mp3 -filter_complex \"{f}\" -map \"[o]\" -c:a aac -b:a 256k -ar 48000 spot/mix.m4a")
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
