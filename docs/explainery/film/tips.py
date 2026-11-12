#!/usr/bin/env python3
"""Krótkie porady DUO (hook + porada + zapisz/wyślij). Użycie: python3 tips.py plan | tl T01 … | build T01 …"""
import json,os,subprocess,sys,shutil,re
import numpy as np
FPS=30;LEAD=0.25
def sh(c): subprocess.run(c,shell=True,check=True)
def load(f): return np.frombuffer(subprocess.run(['ffmpeg','-nostdin','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,dtype=np.float32)
H,T,C_='hook','tip','cta'
TIPS={
 'T01':dict(A='hE1',B='tB01',cta='save',hook=(['Kłótnia','wymyka się','spod kontroli?'],2),card=(['„Potrzebuję 20 minut.','Wrócę do tej rozmowy.”'],0),cardAt=2,units=[
   (H,'Kłótnia wymyka się spod kontroli?'),(T,'Powiedz jedno zdanie:'),(T,'„Potrzebuję dwudziestu minut. Wrócę do tej rozmowy.”'),(T,'I naprawdę wróć.'),(T,'Przerwa to nie ucieczka, tylko hamulec.'),(C_,'Zapisz ten film, zanim znów się przyda.')]),
 'T02':dict(A='tA02',B='tB02',cta='share',hook=(['Mówisz','„ty nigdy”','i „ty zawsze”?'],2),card=(['Zamiast „ty nigdy…”','„Pomożesz mi dziś?”'],1),cardAt=3,units=[
   (H,'Mówisz: ty nigdy, i: ty zawsze?'),(T,'Te dwa słowa zamykają rozmowę, zanim się zacznie.'),(T,'Zamiast: „nigdy mi nie pomagasz”, powiedz:'),(T,'„Jestem zmęczona. Pomożesz mi dziś z kolacją?”'),(T,'Jedna konkretna prośba zamiast oceny.'),(C_,'Wyślij to osobie, z którą chcesz się lepiej dogadać.')]),
 'T03':dict(A='hC',B='tB03',cta='save',hook=(['Trzeci dzień','ciszy','w domu?'],1),card=(['„Nie chcę, żebyśmy','tak milczeli.”'],1),cardAt=3,units=[
   (H,'Trzeci dzień ciszy w domu?'),(T,'Nie czekaj na idealne słowa. Nie przyjdą.'),(T,'Wystarczy jedno zdanie:'),(T,'„Nie chcę, żebyśmy tak milczeli.”'),(T,'Nie musisz od razu wyjaśniać wszystkiego.'),(T,'Wystarczy otworzyć drzwi.'),(C_,'Zapisz to zdanie na później.')]),
 'T04':dict(A='tA04',B='tB04',cta='share',hook=(['Rozmawiacie już tylko','o dzieciach','i rachunkach?'],2),card=(['10 minut dziennie','„Co dziś było','dla Ciebie ważne?”'],0),cardAt=1,units=[
   (H,'Rozmawiacie już tylko o dzieciach i rachunkach?'),(T,'Dziesięć minut dziennie.'),(T,'Bez telefonów, bez listy zadań.'),(T,'I jedno pytanie: „Co dziś było dla Ciebie ważne?”'),(T,'Tylko słuchaj. Nie naprawiaj.'),(C_,'Wyślij to mężowi albo żonie i zacznijcie dziś wieczorem.')]),
 'T05':dict(A='tA05',B='tB05',cta='save',hook=(['Po kłótni','każde idzie','w swój kąt?'],2),card=(['„Przepraszam za ton.','Dokończmy spokojnie.”'],0),cardAt=3,units=[
   (H,'Po kłótni każde idzie w swój kąt?'),(T,'Najważniejsza jest pierwsza doba.'),(T,'Wróć z jednym zdaniem:'),(T,'„Przepraszam za ton. Chcę dokończyć tę rozmowę spokojnie.”'),(T,'Przepraszasz za sposób, a nie za to, że masz swoje zdanie.'),(C_,'Zapisz na następny raz.')]),
 'T06':dict(A='tA06',B='tB06',cta='share',hook=(['Każde','„musimy porozmawiać”','kończy się kłótnią?'],2),card=(['Zamiast zarzutu:','„Martwię się o nas.”'],1),cardAt=3,units=[
   (H,'Każde: musimy porozmawiać, kończy się kłótnią?'),(T,'Pierwsze zdanie ustawia całą rozmowę.'),(T,'Zacznij od siebie, nie od zarzutu.'),(T,'„Martwię się o nas” zamiast „znowu to zrobiłeś”.'),(T,'Zarzut wywołuje obronę. Troska – rozmowę.'),(C_,'Wyślij to komuś, komu się przyda.')]),
 'T07':dict(A='tA07',B='tB07',cta='share',hook=(['Kiedy ostatnio','powiedzieliście sobie','„dziękuję”?'],2),card=(['Raz dziennie','jedno konkretne','„dziękuję”'],2),cardAt=1,units=[
   (H,'Kiedy ostatnio powiedzieliście sobie: dziękuję?'),(T,'Raz dziennie zauważ jedną konkretną rzecz.'),(T,'Nie: „dzięki za wszystko”.'),(T,'Tylko: „dziękuję, że odebrałeś dzieci”.'),(T,'Konkret pokazuje, że naprawdę widzisz drugą osobę.'),(C_,'Wyślij to osobie, której chcesz dziś podziękować.')]),
 'T08':dict(A='tA08',B='tB08',cta='save',hook=(['Słuchasz,','czy tylko czekasz','na swoją kolej?'],2),card=(['Najpierw powtórz:','„Czyli chodzi Ci','o to, że…”'],0),cardAt=2,units=[
   (H,'Słuchasz, czy tylko czekasz na swoją kolej?'),(T,'Zanim odpowiesz, powtórz własnymi słowami to, co słyszysz.'),(T,'„Czyli chodzi Ci o to, że…”'),(T,'Dopiero potem powiedz swoje.'),(T,'Często już to zmienia ton rozmowy.'),(C_,'Zapisz i wypróbuj dziś wieczorem.')]),
 'T09':dict(A='tA09',B='tB09',cta='share',hook=(['„Ja robię w domu','wszystko.”','Oboje tak mówicie?'],2),card=(['Jedna kartka.','Wszystkie obowiązki.','Potem rozmowa.'],0),cardAt=2,units=[
   (H,'Ja robię w domu wszystko. Oboje tak mówicie?'),(T,'Każde z Was widzi głównie swoją część.'),(T,'Spiszcie na jednej kartce wszystko, co robicie w domu.'),(T,'Naprawdę wszystko.'),(T,'Dopiero potem rozmawiajcie o podziale.'),(T,'O liście, nie o sobie.'),(C_,'Wyślij to swojej drugiej połowie.')]),
 'T10':dict(A='hH',B='tB10',cta='save',hook=(['Jesteście już','tylko','mamą i tatą?'],2),card=(['1 godzina w tygodniu','tylko dla Was'],0),cardAt=1,units=[
   (H,'Jesteście już tylko mamą i tatą?'),(T,'Wpiszcie do kalendarza jedną godzinę w tygodniu tylko dla Was.'),(T,'Jak wizytę, której się nie odwołuje.'),(T,'Nie musi być kolacja w mieście.'),(T,'Wystarczy spacer bez telefonów.'),(C_,'Zapisz i wpiszcie termin jeszcze dziś.')]),
}
CTA_TXT={'save':'Zapisz na później','share':'Wyślij dalej'}
def align(k):
    x=load(f'tips/{k}.mp3');fr=np.array([np.sqrt((x[i:i+320]**2).mean()) for i in range(0,len(x)-320,320)]);sp=fr>0.012
    idx=np.where(sp)[0];a0,b0=idx[0],idx[-1]+1
    sil=[];i=a0
    while i<b0:
        if not sp[i]:
            j=i
            while j<b0 and not sp[j]: j+=1
            if (j-i)*0.02>=0.2: sil.append((i*0.02,j*0.02))
            i=j
        else: i+=1
    real=np.arange(len(sp))*0.02;spt=np.cumsum(sp)*0.02;S=spt[b0-1]
    units=TIPS[k]['units'];w=[len(re.sub(r'[^a-ząćęłńóśźż0-9]','',u[1].lower())) for u in units];cum=np.cumsum(w)/sum(w)
    bounds=[];used=-1
    for c in cum[:-1]:
        t=real[np.searchsorted(spt,c*S)]
        best=None
        for si in range(used+1,len(sil)):
            mid=(sil[si][0]+sil[si][1])/2
            if abs(mid-t)<=0.9 and (best is None or abs(mid-t)<abs((sil[best][0]+sil[best][1])/2-t)): best=si
        if best is not None: bounds.append(sil[best]);used=best
        else: bounds.append((t-0.03,t+0.03))
    st=[a0*0.02]+[b[1] for b in bounds];en=[b[0] for b in bounds]+[b0*0.02]
    lv=20*np.log10(np.sqrt((fr[sp]**2).mean()))
    return [(s+LEAD,e+LEAD) for s,e in zip(st,en)],float(lv),len(sil)
def timeline(k):
    cfg=TIPS[k];seg,lv,ns=align(k);units=cfg['units'];ft=next(i for i,u in enumerate(units) if u[0]==T);ci=len(units)-1
    tA=round(seg[ft][0]-0.12,3);dur=round((seg[-1][1]+1.3)*FPS)/FPS;hl,hp=cfg['hook'];hd=seg[0][1]-seg[0][0];n=len(hl)
    def clip(name):
        d=f'clips/{name}';c=len(os.listdir(d)) if os.path.isdir(d) else 0
        return dict(n=c,fps=30,dur=round((c-1)/30,3)) if c else None
    tl=dict(dur=dur,A=dict(img=cfg['A'],a=0,b=tA,clip=clip(cfg['A'])),B=dict(img=cfg['B'],a=tA,b=dur,clip=clip(cfg['B'])),
      hook=dict(lines=hl,pill=hp,times=[0 if i==0 else round(0.25+hd*(i/n)*0.5,3) for i in range(n)]),
      card=dict(lines=cfg['card'][0],pill=cfg['card'][1],t0=round(seg[cfg['cardAt']][0],3)),
      caps=[[round(seg[i][0]-0.03,3),round(seg[i][1]+0.08,3),units[i][1]] for i in range(ft,ci)],
      cta=dict(type=cfg['cta'],text=CTA_TXT[cfg['cta']],t0=round(seg[ci][0]-0.05,3)),logoAt=round(tA+0.9,3))
    return tl,lv,seg,ns
def audio(k,tl,lv,out):
    D=tl['dur'];g=-15.0-lv;hp=tl['hook']['pill']
    acc=[('pop',tl['hook']['times'][hp]+0.02 if hp else tl['hook']['times'][-1]+0.02,.3),('whoosh',tl['A']['b']-0.1,.8),('pop',tl['card']['t0']+0.02,.3),('chime',tl['cta']['t0']-0.05,.32),('pop',tl['cta']['t0']+0.05,.34)]
    ins=f"-i tips/{k}.mp3 -ss 42 -i music.mp3";f=f"[0:a]volume={g:.2f}dB,adelay={int(LEAD*1000)}:all=1[v];[1:a]atrim=0:{D:.2f},asetpts=PTS-STARTPTS,volume=0.13,afade=t=in:d=0.6,afade=t=out:st={D-1.3:.2f}:d=1.3[m];"
    mix="[v][m]";n=2
    for name,t,v in acc: ins+=f" -i sfx_{name}.mp3";f+=f"[{n}:a]volume={v},adelay={int(max(0,t)*1000)}:all=1[a{n}];";mix+=f"[a{n}]";n+=1
    f+=f"{mix}amix=inputs={n}:normalize=0:duration=longest,alimiter=limit=0.95[out]"
    sh(f"ffmpeg -nostdin -v error -y {ins} -filter_complex \"{f}\" -map \"[out]\" -t {D:.3f} -c:a aac -b:a 192k -ar 48000 {out}")
def build(k):
    tl,lv,seg,ns=timeline(k);p=f'tips/tl_{k}.json';json.dump(tl,open(p,'w'),ensure_ascii=False,indent=1)
    N=round(tl['dur']*FPS);fd=f'fr_{k}';shutil.rmtree(fd,ignore_errors=True);os.makedirs(fd);q=[0,N//3,2*N//3,N]
    pr=[subprocess.Popen(f"PAGE=tips.html TL={p} OUT={fd} node render.js frames {q[i]} {q[i+1]}",shell=True,stdout=subprocess.DEVNULL) for i in range(3)]
    audio(k,tl,lv,f'tips/mix_{k}.m4a')
    for x in pr: x.wait()
    assert len(os.listdir(fd))==N,(len(os.listdir(fd)),N)
    os.makedirs('out_tips',exist_ok=True);out=f'out_tips/duo-porada-{k}.mp4'
    sh(f"ffmpeg -nostdin -v error -y -framerate 30 -i {fd}/f%05d.jpg -i tips/mix_{k}.m4a -c:v libx264 -preset medium -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy -shortest {out}")
    shutil.rmtree(fd);print(k,'->',out,'%.1f s'%tl['dur'],flush=True)
if __name__=='__main__':
    m=sys.argv[1];ks=sys.argv[2:] or list(TIPS)
    if m=='plan':
        for k in ks:
            tl,lv,seg,ns=timeline(k);print(k,'dur %.1f'%tl['dur'],'tA %.2f'%tl['A']['b'],'units',len(seg),'silences',ns,'|',' '.join('%.1f-%.1f'%s for s in seg))
    elif m=='tl':
        for k in ks: tl,*_=timeline(k);json.dump(tl,open(f'tips/tl_{k}.json','w'),ensure_ascii=False,indent=1)
    elif m=='build':
        for k in ks: build(k)
