#!/usr/bin/env python3
"""Seria „wewnętrzny dialog” (W01–W10 dla niej, M01–M10 dla niego): szeptana myśl w chmurce nad bohaterem
+ zakończenie standardowym głosem i przycisk „Wyślij”. Użycie: python3 inner.py plan | tl W01 … | build W01 …
Korzysta z renderera tips.html (TL.inner / TL.full) i funkcji z tips.py."""
import json,os,subprocess,sys,shutil
import numpy as np
from tips import load,words,sh,lvl,FPS,ptf
INNER={
 'W01':('Wolałabym się wygadać, niż żeby mi doradzał, kiedy opowiadam mu o swoim problemie.',.40,.41),
 'W02':('Nie chcę, żeby pomagał mi w domu. Chcę, żeby to był też jego dom.',.45,.39),
 'W03':('Chciałabym, żeby czasem zapytał, jak się czuję. A nie, co na obiad.',.43,.48),
 'W04':('Kiedy mówię „nic się nie stało”, tak naprawdę czekam, aż zapyta jeszcze raz.',.43,.43),
 'W05':('Tęsknię za nim, chociaż siedzi obok mnie na kanapie.',.73,.42),
 'W06':('Nie potrzebuję wielkich gestów. Wystarczy, że przytuli mnie bez powodu.',.45,.40),
 'W07':('Jestem zmęczona tym, że o wszystkim muszę pamiętać sama.',.48,.44),
 'W08':('Chciałabym, żeby zauważył, ile robię, zanim sama mu o tym powiem.',.50,.36),
 'W09':('Kiedy milknę, to nie znaczy, że jest dobrze. To znaczy, że nie mam już siły tłumaczyć.',.48,.38),
 'W10':('Boję się powiedzieć, czego mi brakuje, bo znowu skończy się kłótnią.',.43,.44),
 'M01':('Nie wiem, jak jej pomóc, kiedy jest jej źle. Więc doradzam. I widzę, że to nie to.',.45,.43),
 'M02':('Chciałbym usłyszeć, że coś robię dobrze. Nie tylko to, czego znowu nie zrobiłem.',.50,.45),
 'M03':('Kiedy milczę, to nie dlatego, że mi nie zależy. Po prostu nie wiem, jak to powiedzieć.',.55,.45),
 'M04':('Wracam z pracy i potrzebuję 10 minut ciszy. To nie znaczy, że nie chcę z nią być.',.43,.42),
 'M05':('Boję się zacząć tę rozmowę, bo nie chcę jej zranić.',.45,.37),
 'M06':('Staram się. Tylko chyba nie w tym, na czym jej najbardziej zależy.',.43,.43),
 'M07':('Brakuje mi tego, jak kiedyś się ze mną śmiała.',.43,.45),
 'M08':('Kiedy słyszę „musimy porozmawiać”, od razu czuję, że coś zawaliłem.',.43,.42),
 'M09':('Chciałbym, żeby powiedziała wprost, czego potrzebuje. Naprawdę nie umiem zgadywać.',.45,.40),
 'M10':('Też czuję się samotny. Tylko nikt mnie o to nie pyta.',.43,.44),
}
END={'W':('Jeżeli czasami tak myślisz, wyślij to swojemu mężowi albo partnerowi. Żebyście lepiej się dogadywali.','Wyślij mu ten film','ONA MYŚLI','#c8655f'),
     'M':('Jeżeli czasami tak myślisz, wyślij to swojej żonie albo partnerce. Żebyście lepiej się dogadywali.','Wyślij jej ten film','ON MYŚLI','#36493d')}
LEAD=0.55;GAP=0.75
def span(f):
    x=load(f);fr=np.array([np.sqrt((x[i:i+320]**2).mean()) for i in range(0,len(x)-320,320)]);sp=fr>max(0.004,0.12*fr.max());i=np.where(sp)[0]
    return i[0]*0.02,(i[-1]+1)*0.02,float(20*np.log10(np.sqrt((fr[sp]**2).mean())))
def timeline(k):
    text,fx,fy=INNER[k];g=k[0];et,chip,label,col=END[g];s1,e1,l1=span(f'tips/in_{k}.mp3');s2,e2,l2=span(f'tips/in_end{g}.mp3')
    t1a=LEAD;t1b=LEAD+(e1-s1);t2a=t1b+GAP;t2b=t2a+(e2-s2);dur=round((t2b+1.7)*FPS)/FPS
    d=f'clips/i{k}';n=len(os.listdir(d));clip=dict(n=n,fps=30,dur=round((n-1)/30,3))
    ew=words(et,t2a,t2b);c1=next(i for i,w in enumerate(ew) if w[0].endswith(','))+1;cut=next(i for i,w in enumerate(ew) if w[0].endswith('.'))+1;tw=next(w[1] for w in ew if w[0].lower().startswith('wyślij'))
    tl=dict(dur=dur,full=True,inner=True,A=dict(img='i'+k,a=-0.02,b=-0.01,clip=clip),B=dict(img='i'+k,a=-0.01,b=dur,clip=clip,tau=round(max(clip['dur']*0.9,dur/2.3),3)),
      hook=dict(lines=[],pill=-1,times=[]),logoAt=-0.6,tag=None,
      bubble=dict(t0=-0.6,words=words(text,t1a,t1b+0.05),tail=ptf(fx,fy),think=True,label=label,labelColor=col,top=404,cx=540),
      caps=[dict(a=round(p[0][1]-0.03,3),b=round(p[-1][2]+0.06,3),words=p) for p in (ew[:c1],ew[c1:cut],ew[cut:]) if p],
      cta=dict(type='share',text=chip,t0=round(tw-0.1,3),y=1416,cx=540,scale=0.86),capY=1286,capX=540)
    return tl,dict(off1=t1a-s1,off2=t2a-s2,l1=l1,l2=l2)
def t1a_ms(tl): return tl['bubble']['words'][0][1]*1000-80
def audio(k,tl,a,out):
    D=tl['dur'];g=k[0];c=tl['cta'];ga=-37-lvl('sfx_home.mp3')
    ins=f"-i tips/in_{k}.mp3 -i tips/in_end{g}.mp3 -ss 42 -i music.mp3 -stream_loop -1 -i sfx_home.mp3 -i sfx_pop.mp3 -i sfx_chime.mp3 -i sfx_pop.mp3"
    f=(f"[0:a]volume={-17.0-a['l1']:.2f}dB,adelay={int(max(0,a['off1'])*1000)}:all=1[v1];[1:a]volume={-15.0-a['l2']:.2f}dB,adelay={int(a['off2']*1000)}:all=1[v2];"
       f"[2:a]atrim=0:{D:.2f},asetpts=PTS-STARTPTS,volume=0.10,afade=t=in:d=0.8,afade=t=out:st={D-1.4:.2f}:d=1.4[m];"
       f"[3:a]atrim=0:{D:.2f},asetpts=PTS-STARTPTS,volume={ga:.2f}dB,afade=t=in:d=1.0,afade=t=out:st={D-1.2:.2f}:d=1.2[amb];"
       f"[4:a]volume=0.26,adelay={int(max(0,t1a_ms(tl)))}:all=1[p1];[5:a]volume=0.3,adelay={int(c['t0']*1000)}:all=1[ch];[6:a]volume=0.32,adelay={int(c['t0']*1000+80)}:all=1[p2];"
       f"[v1][v2][m][amb][p1][ch][p2]amix=inputs=7:normalize=0:duration=longest,alimiter=limit=0.95[out]")
    sh(f"ffmpeg -nostdin -v error -y {ins} -filter_complex \"{f}\" -map \"[out]\" -t {D:.3f} -c:a aac -b:a 192k -ar 48000 {out}")
def build(k):
    tl,a=timeline(k);p=f'tips/tl_{k}.json';json.dump(tl,open(p,'w'),ensure_ascii=False,indent=1)
    N=round(tl['dur']*FPS);fd=f'fr_{k}';shutil.rmtree(fd,ignore_errors=True);os.makedirs(fd);q=[0,N//3,2*N//3,N]
    pr=[subprocess.Popen(f"PAGE=tips.html TL={p} OUT={fd} node render.js frames {q[i]} {q[i+1]}",shell=True,stdout=subprocess.DEVNULL) for i in range(3)]
    audio(k,tl,a,f'tips/mix_{k}.m4a')
    for x in pr: x.wait()
    assert len(os.listdir(fd))==N,(len(os.listdir(fd)),N)
    os.makedirs('out_inner',exist_ok=True);out=f'out_inner/duo-mysli-{k}.mp4'
    sh(f"ffmpeg -nostdin -v error -y -framerate 30 -i {fd}/f%05d.jpg -i tips/mix_{k}.m4a -c:v libx264 -preset medium -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy -shortest {out}")
    shutil.rmtree(fd);print(k,'->',out,'%.1f s'%tl['dur'],flush=True)
if __name__=='__main__':
    m=sys.argv[1];ks=sys.argv[2:] or list(INNER)
    if m=='plan':
        for k in ks: tl,a=timeline(k);print(k,'dur %.1f'%tl['dur'],'chip %.1f'%tl['cta']['t0'],a)
    elif m=='tl':
        for k in ks: tl,a=timeline(k);json.dump(tl,open(f'tips/tl_{k}.json','w'),ensure_ascii=False,indent=1)
    elif m=='build':
        for k in ks: build(k)
