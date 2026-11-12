#!/usr/bin/env python3
"""Warianty hooka filmu „Mgła”: dla każdego hooka buduje ścieżkę głosu, oś czasu i miks,
renderuje tylko pierwsze ujęcie (hook + zdanie przejścia) i dokleja wspólną resztę filmu.
Użycie: python3 variants.py prep | python3 variants.py build H05 [H06 ...] | python3 variants.py list"""
import json,os,subprocess,sys,shutil
import numpy as np
FPS=30;CUT=4.73;BASE='timeline_v9.json'
def sh(cmd): subprocess.run(cmd,shell=True,check=True)
def load(f,a=None,b=None):
    cmd=['ffmpeg','-nostdin','-v','error']+(['-ss',str(a),'-t',str(b-a)] if a is not None else [])+['-i',f,'-ac','1','-ar','16000','-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,dtype=np.float32)
def act(x):
    fr=np.array([np.sqrt((x[i:i+320]**2).mean()) for i in range(0,len(x)-320,320)]);m=fr>0.012;idx=np.where(m)[0]
    return float(20*np.log10(np.sqrt((fr[m]**2).mean()))),idx[0]*0.02,(idx[-1]+1)*0.02
SOFA=dict(img='s01',tearX=0.5,shiftX=-70,shiftY=120,rings=[[0.195,0.478],[0.83,0.482]])
def im(name,tearX,shiftX=-70): return dict(img=name,tearX=tearX,shiftX=shiftX,shiftY=50,scale=0.86,rings=None)
B=im('hB',0.52);C=im('hC',0.5);D=im('hD',0.52,-85);E1=im('hE1',0.51,-50);E2=im('hE2',0.55,-85)
F=im('hF',0.5);G=im('hG',0.5,-60);Hc=im('hH',0.49,-60);I=im('hI',0.47,-80)
BR={'def':('Niby nic się nie dzieje.','bridge_def.wav'),'zw':('Niby zwykłe sprawy.','bridge_zw.wav'),'zd':('Niby życie toczy się dalej.','bridge_zd.wav')}
HOOKS={
 'H01':(None,['Żyjesz z mężem','jak ze','współlokatorem?'],2,SOFA,'def'),
 'H02':('h02',['Żyjesz z żoną','jak ze','współlokatorką?'],2,SOFA,'def'),
 'H03':('h03',['Od miesięcy','nie dogadujesz się','z mężem?'],1,B,'def'),
 'H04':('h04',['Od miesięcy','nie dogadujesz się','z żoną?'],1,B,'def'),
 'H05':('h05',['Nie kłócicie się.','Po prostu już ze sobą','nie rozmawiacie?'],2,C,'def'),
 'H06':('h06',['Każda rozmowa','z żoną kończy się','tak samo?'],2,E1,'zw'),
 'H07':('h07',['Raz chcesz walczyć','o to małżeństwo,','a raz odejść?'],2,D,'def'),
 'H08':('h08',['Masz wrażenie,','że cokolwiek powiesz','w domu, będzie źle?'],2,E2,'zw'),
 'H09':('h09',['Mieszkacie razem.','Ale czy jeszcze','jesteście razem?'],2,SOFA,'def'),
 'H10':('h10',['Nie wiesz,','czy to kryzys,','czy już koniec?'],2,F,'def'),
 'H11':('h11',['Kłócisz się','z mężem','o wszystko?'],2,E1,'zw'),
 'H12':('h12',['Kłócisz się','z żoną','o wszystko?'],2,E1,'zw'),
 'H14':('h14',['Od dawna','nie ma między Wami','bliskości?'],2,G,'def'),
 'H15':('h15',['Ciche dni','trwają u Was','coraz dłużej?'],0,C,'def'),
 'H16':('h16',['Zostajesz','w tym małżeństwie','już tylko dla dzieci?'],2,Hc,'def'),
 'H17':('h17',['Po zdradzie','nie wiesz,','co dalej?'],0,I,'zd'),
}
ACC=[('whoosh',4.62,.75),('pop',4.76,.34),('whoosh',5.57,.75),('pop',5.71,.34),('whoosh',6.37,.75),('pop',6.51,.34),('pop',9.45,.26),('pop',10.75,.26),
     ('whoosh',18.79,.7),('pop',18.93,.3),('whoosh',19.61,.7),('pop',19.75,.3),('whoosh',20.47,.7),('pop',20.61,.3),('chime',27.5,.4),
     ('pop',36.21,.2),('pop',37.53,.2),('pop',38.73,.2),('pop',43.61,.22),('pop',44.53,.22),('pop',45.81,.22),('chime',60.7,.5)]
def prep():
    sh(f"ffmpeg -nostdin -v error -y -ss {CUT} -i voice2.m4a -ar 48000 -ac 1 body_tail.wav")
    sh(f"ffmpeg -nostdin -v error -y -ss 0 -t 2.97 -i voice2.m4a -ar 48000 -ac 1 hooks/h01n.wav")
    sh(f"ffmpeg -nostdin -v error -y -ss 2.97 -t {CUT-2.97} -i voice2.m4a -ar 48000 -ac 1 bridge_def.wav")
    ref=act(load('bridge_def.wav'))[0]
    for key,src,end,total in (('zw','hooks/brZ.mp3',1.60,1.90),('zd','hooks/brD.mp3',1.82,2.12)):
        g=ref-act(load(src,0,end))[0]
        sh(f"ffmpeg -nostdin -v error -y -t {end} -i {src} -af \"volume={g:.2f}dB,afade=t=out:st={end-0.05}:d=0.05,adelay=140:all=1,apad=whole_dur={total+0.14}\" -ar 48000 -ac 1 bridge_{key}.wav")
    refh=act(load('hooks/h01n.wav'))[0]
    for k,(src,*_) in HOOKS.items():
        if not src: continue
        lv,a,b=act(load(f'hooks/{src}.mp3'))
        sh(f"ffmpeg -nostdin -v error -y -i hooks/{src}.mp3 -af volume={refh-lv:.2f}dB -ar 48000 -ac 1 hooks/{src}n.wav")
    print('prep ok')
def plan(k):
    src,lines,pill,img,br=HOOKS[k];hf=f"hooks/{src or 'h01'}n.wav";_,a,b=act(load(hf))
    hs=0.3;off=hs-a;he=off+b                       # mowa hooka zaczyna się w 0,3 s
    btxt,bf=BR[br];_,ba,bb=act(load(bf));blen=len(load(bf))/16000
    bstart=he+0.37;A=round((bstart+blen)*FPS)/FPS    # cięcie do sceny „PRACA”
    n=len(lines);dur=b-a;times=[0 if i==0 else 0.2+dur*(i/n)*0.5 for i in range(n)];tear=times[-1]+0.45
    return dict(k=k,hf=hf,off=off,he=he,bf=bf,btxt=btxt,bstart=bstart,ba=ba,bb=bb,A=A,delta=A-CUT,dur=dur,times=times,tear=tear,lines=lines,pill=pill,img=img)
def timeline(p):
    t=json.load(open(BASE));d=p['delta'];s=lambda x:round(x+d,3)
    t['shots']=[[n,(0 if n=='s01' else s(a)),s(b)] for n,a,b in t['shots']]
    t['caps']=[[s(a),s(b),x] for a,b,x in t['caps'] if a>CUT]+[[round(p['bstart']+p['ba']-0.08,2),round(p['bstart']+p['bb']+0.05,2),p['btxt']]]
    t['caps'].sort(key=lambda c:c[0])
    ev={}
    for key,v in t['ev'].items(): ev[key]=[s(x) for x in v] if isinstance(v,list) else s(v)
    ev['hook']=[0.2,round(p['A']-0.2,3)];t['ev']=ev;t['T0']=s(t['T0'])
    t['hook']=dict(lines=p['lines'],pill=p['pill'],dur=round(p['dur'],3),**{k:v for k,v in p['img'].items() if v is not None})
    if p['img']['rings'] is None: t['hook']['rings']=[]
    return t
def audio(p,out):
    d=p['delta'];D=70.75+d;k=p['k']
    sh(f"ffmpeg -nostdin -v error -y -i {p['hf']} -i {p['bf']} -i body_tail.wav -filter_complex \"[0:a]atrim=start={max(0,-p['off']):.3f},asetpts=PTS-STARTPTS,adelay={int(max(0,p['off'])*1000)}:all=1[h];[1:a]adelay={int(p['bstart']*1000)}:all=1[b];[2:a]adelay={int(p['A']*1000)}:all=1[t];[h][b][t]amix=inputs=3:normalize=0:duration=longest[o]\" -map \"[o]\" -ar 48000 voice_{k}.wav")
    acc=[('tear',p['tear']-0.03,1.6)]+([('pop',p['times'][p['pill']]+0.02,.3)] if p['pill'] else [('pop',p['times'][-1]+0.02,.3)])+[(n,t+d,v) for n,t,v in ACC]
    ins=f"-i voice_{k}.wav -i music.mp3 -i sfx_fog.mp3 -i sfx_fog.mp3 -i sfx_birds.mp3"
    f=(f"[1:a]atrim=0:{D:.2f},volume=0.15,afade=t=in:d=1.5,afade=t=out:st={D-3.25:.2f}:d=3.2[m];"
       f"[2:a]volume=9,afade=t=in:d=2.5,afade=t=out:st=11:d=3,adelay={int((11+d)*1000)}:all=1[f1];"
       f"[3:a]volume=9,afade=t=in:d=3,afade=t=out:st=5.5:d=2.5,atrim=0:8,adelay={int((22+d)*1000)}:all=1[f2];"
       f"[4:a]volume=4.5,afade=t=in:d=2,afade=t=out:st=14.5:d=3.5,adelay={int((41.2+d)*1000)}:all=1[b];")
    mix="[0:a][m][f1][f2][b]";n=5
    for name,t,v in acc:
        ins+=f" -i sfx_{name}.mp3";f+=f"[{n}:a]volume={v},adelay={int(max(0,t)*1000)}:all=1[a{n}];";mix+=f"[a{n}]";n+=1
    f+=f"{mix}amix=inputs={n}:normalize=0:duration=first,alimiter=limit=0.95[out]"
    sh(f"ffmpeg -nostdin -v error -y {ins} -filter_complex \"{f}\" -map \"[out]\" -t {D:.3f} -c:a aac -b:a 192k -ar 48000 {out}")
def build(k,stills=False):
    p=plan(k);t=timeline(p);tl=f"timeline_{k}.json";json.dump(t,open(tl,'w'),ensure_ascii=False,indent=1)
    nA=round(p['A']*FPS)
    if stills: return p,tl,nA
    fd=f"fr_{k}";shutil.rmtree(fd,ignore_errors=True);os.makedirs(fd)
    half=nA//2
    pr=[subprocess.Popen(f"TL={tl} OUT={fd} node render.js frames {a} {b}",shell=True,stdout=subprocess.DEVNULL) for a,b in ((0,half),(half,nA))]
    audio(p,f"mix_{k}.m4a")
    for x in pr: x.wait()
    assert len(os.listdir(fd))==nA,(len(os.listdir(fd)),nA)
    body0=round(CUT*FPS);total=len([f for f in os.listdir('frames') if f.startswith('f')])
    for i in range(body0,total): os.symlink(os.path.abspath(f"frames/f{i:05d}.jpg"),f"{fd}/f{i-body0+nA:05d}.jpg")
    out=f"out/duo-mgla-{k}.mp4";os.makedirs('out',exist_ok=True)
    sh(f"ffmpeg -nostdin -v error -y -framerate 30 -i {fd}/f%05d.jpg -i mix_{k}.m4a -c:v libx264 -preset medium -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy -shortest {out}")
    shutil.rmtree(fd);print(k,'->',out,'A=%.2f'%p['A'],flush=True)
if __name__=='__main__':
    m=sys.argv[1]
    if m=='prep': prep()
    elif m=='list':
        for k in HOOKS: p=plan(k);print(k,'A=%.2f'%p['A'],'hook %.2f'%p['dur'],p['btxt'],p['img']['img'])
    elif m=='tl':
        for k in sys.argv[2:]: p,tl,nA=build(k,True);print(k,tl,nA,round(p['tear'],2))
    elif m=='build':
        for k in sys.argv[2:]: build(k)
